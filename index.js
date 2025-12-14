import { LitElement, html, css } from 'https://unpkg.com/lit@latest?module';

class MyApp extends LitElement {
  static styles = css`
    h1 {
      color: red;
    }
  `
  render() {
    return html`
    <h1>Hello</h1>
    `;
  }
}
customElements.define('my-app', MyApp);