import { getCssClassPath, getDomPath } from './index'

describe('getDomPath', () => {
  test('one element', () => {
    const div = document.createElement('div')
    expect(getDomPath(div)).toBe('div')
  })

  test('nested elements', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div class="form">
        <form>
          <div class="form__field field">
            <input type="text" name="username" id="username" class="field__input" />
          </div>
        </form>
      </div>
    `

    const input = div.querySelector('#username')
    if (!input) {
      fail('it should not reach here')
    }

    const path = getDomPath(input, div)

    expect(path).toBe(
      'div > div.form > form > div.form__field.field > input#username.field__input[type="text"][name="username"]',
    )
  })

  test('brothers', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div class="form">
        <form>
          <div class="form__field field">
            <input type="text" class="field__input" />
            <input type="text" class="field__input" />
          </div>
        </form>
      </div>
    `
    const firstInput = div.querySelectorAll('.field__input')[0]
    const secondInput = div.querySelectorAll('.field__input')[1]

    if (!firstInput || !secondInput) {
      fail('it should not reach here')
    }

    expect(getDomPath(firstInput, div)).toBe(
      'div > div.form > form > div.form__field.field > input.field__input[type="text"]',
    )
    expect(getDomPath(secondInput, div)).toBe(
      'div > div.form > form > div.form__field.field > input.field__input[type="text"] | [2/2]',
    )
  })
})

describe('getCssClassPath', () => {
  test('classpath', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div class="parent">
        <div id="element-id">
          <a href="https://google.com">
            <div class="child">
              <span id="nested"></span>
            </div>
          </a>
        </div>
      </div>
    `

    const target = div.querySelector('#nested')
    if (!target) {
      fail('it should not reach here')
    }

    const path = getCssClassPath(target)

    expect(path).toBe('div > .parent > div > a > .child > span')
  })
})
