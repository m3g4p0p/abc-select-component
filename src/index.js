import abcjs from 'abcjs'
import fromHTML from 'from-html'

import {
  getTitle,
  printNode,
  trimBlankLines
} from './util'

import css from './scss/abc-select.scss'

const CLASS = {
  BASE: 'abc-select-modal',
  ELEMENT: {
    OVERLAY: '__overlay',
    CONTENT: '__content',
    NOTES: '__notes',
    CONTROLS: '__controls'
  },
  MODIFIER: {
    ACTIVE: '--active',
    VISIBLE: '--visible'
  }
}

export default class AbcSelectComponent extends HTMLElement {
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')

    fromHTML(`
      <div ref="overlay" class="${CLASS.BASE + CLASS.ELEMENT.OVERLAY}">
        <div class="${CLASS.BASE + CLASS.ELEMENT.CONTENT}">
          <div class="${CLASS.BASE + CLASS.ELEMENT.CONTROLS}">
            <span>transpose:</span>
            <button ref="transposeUp" title="transpose up">up</button>
            <button ref="transposeDown" title="transpose down">down</button>
            <span>|</span>
            <button ref="print" title="print notes">print</button>
            <a ref="save" title="save selection">save</a>
            <button ref="close" title="close">&#128473;</button>
          </div>
          <div ref="notes" class="${CLASS.BASE + CLASS.ELEMENT.NOTES}"></div>
        </div>
      </div>
    `, this, true)

    style.textContent = css
    this.isActive = false
    this.visualTranspose = 0
    this.selection = ''

    shadow.appendChild(style)
    shadow.appendChild(this.overlay)
  }

  connectedCallback () {
    this.shadowRoot.addEventListener('click', this)
    this.shadowRoot.addEventListener('keydown', this)
  }

  disconnectedCallback () {
    this.shadowRoot.removeEventListener('click', this)
    this.shadowRoot.removeEventListener('keydown', this)
  }

  get title () {
    return getTitle(this.selection) || document.title
  }

  handleClick ({ target }) {
    switch (target) {
      case this.overlay:
        this.toggleActive()
        break

      case this.print:
        printNode(this.notes, this.title)
        break

      case this.transposeDown:
        this.transpose(-1)
        break

      case this.transposeUp:
        this.transpose(1)
        break

      case this.close:
        this.toggleActive()
        break

      default:
        // Do nothing
    }
  }

  handleKeydown (event) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        this.transpose(1)
        break

      case 'ArrowDown':
        event.preventDefault()
        this.transpose(-1)
        break

      case 'Escape':
        this.toggleActive()
        break

      default:
        // Do nothing
    }
  }

  handleEvent (event) {
    if (!this.isActive) {
      return
    }

    switch (event.type) {
      case 'click':
        this.handleClick(event)
        break

      case 'keydown':
        this.handleKeydown(event)
        break

      default:
        // Do nothing
    }
  }

  toggleActive () {
    const isActive = !this.isActive
    const { overlay } = this

    const toggleActive = () => overlay.classList.toggle(
      CLASS.BASE +
      CLASS.ELEMENT.OVERLAY +
      CLASS.MODIFIER.ACTIVE,
      isActive
    )

    const toggleVisible = () => overlay.classList.toggle(
      CLASS.BASE +
      CLASS.ELEMENT.OVERLAY +
      CLASS.MODIFIER.VISIBLE,
      isActive
    )

    if (isActive) {
      toggleActive()
      window.setTimeout(toggleVisible)
    } else {
      toggleVisible()

      overlay.addEventListener(
        'transitionend',
        toggleActive,
        { once: true }
      )
    }

    this.isActive = isActive

    return this
  }

  transpose (value) {
    this.visualTranspose += value
    return this.render()
  }

  render () {
    const {
      notes,
      selection,
      visualTranspose
    } = this

    abcjs.renderAbc(
      notes,
      selection,
      { visualTranspose }
    )

    return this
  }

  updateDownloadURL () {
    const blob = new Blob([this.selection], {
      type: 'text/plain;charset=utf-8'
    })

    window.URL.revokeObjectURL(this.save.href)
    this.save.href = window.URL.createObjectURL(blob)
    this.save.download = this.title

    return this
  }

  setSelection () {
    const selection = window.getSelection().toString()

    this.selection = trimBlankLines(selection) || this.selection
    this.visualTranspose = 0

    if (this.selection) {
      this.render().updateDownloadURL()
    }

    return this
  }

  toggle () {
    this.toggleActive()

    if (this.isActive) {
      this.setSelection()
    }

    return this
  }
}
