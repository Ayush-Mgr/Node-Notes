const { marked } = require('marked');

const mathExtension = {
  name: 'math',
  level: 'inline',
  start(src) {
    return src.match(/\$/)?.index;
  },
  tokenizer(src, tokens) {
    const blockRule = /^\$\$(.*?)\$\$/s;
    const inlineRule = /^\$([^$\n]+?)\$/;
    let match;
    if ((match = blockRule.exec(src))) {
      return {
        type: 'math',
        raw: match[0],
        text: match[1],
        displayMode: true
      };
    } else if ((match = inlineRule.exec(src))) {
      return {
        type: 'math',
        raw: match[0],
        text: match[1],
        displayMode: false
      };
    }
  },
  renderer(token) {
    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (s) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
    if (token.displayMode) {
      return `\\[${escapeHtml(token.text)}\\]`;
    } else {
      return `\\(${escapeHtml(token.text)}\\)`;
    }
  }
};

marked.use({ extensions: [mathExtension] });

console.log(marked.parse('Hello $x * y$ and $$a < b$$'));
