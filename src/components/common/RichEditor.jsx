import React from 'react'
import { ContentState, Editor, EditorState, RichUtils, convertFromHTML, getDefaultKeyBinding } from 'draft-js'
import { Hidden } from 'components/forms'

const BLOCK_DECODER_MAP = {
  'blockquote': 'blockquote',
  'header-one': 'h1',
  'header-two': 'h2',
  'header-three': 'h3',
  'header-four': 'h4',
  'header-five': 'h5',
  'header-six': 'h6',
  'ordered-list-item': 'ol',
  'unordered-list-item': 'ul',
  'unstyled': 'p',

  'BOLD': 'strong',
  'ITALIC': 'em',
  'UNDERLINE': 'u',
  'CODE': 'tt'
}

export default class RichEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: props.defaultValue
      ? EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(props.defaultValue)))
      : EditorState.createEmpty()
    }

    this.focus = () => this.editor.focus();
    this.onChange = editorState => this.setState({ editorState });

    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);

    this.getContent = _ => {
      let currentList = '';
      let quoting = false, qNext = false;
      let htmlString = this.state.editorState.getCurrentContent().getBlocksAsArray()
        .reduce( (acc, x) => {
          let element_tag = BLOCK_DECODER_MAP[x.getType()];

          if (element_tag[1] === 'l') {
            qNext = element_tag[0] === 'b';
            if (!qNext) {
              if (currentList) acc += `</${currentList}>`
              currentList = element_tag;
              element_tag = 'li';
            }
          }
          else currentList = '';

          if (!quoting) acc += `<${element_tag}>`;
          else acc += qNext ? '<br/>' : '</blockquote>';
          quoting = qNext;

          x.findStyleRanges(x => true, (a,b) => {
            let it = x.getInlineStyleAt(a)[Symbol.iterator](), q = null;
            let stack = [];
            while (!(q = it.next()).done) {
              const style_tag = BLOCK_DECODER_MAP[q.value];
              acc += `<${style_tag}>`;
              stack.push(style_tag);
            }
            acc += x.getText().substr(a,b-a);
            while(stack.length) acc += `</${stack.pop()}>`;
          })
          return quoting ? acc : acc + `</${element_tag}>`;
        }, '');
        return currentList
          ? htmlString + `</${currentList}>`
          : quoting
          ? htmlString + `</blockquote>`
          : htmlString;
    }
  }

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) this.onChange(newState);
    return !!newState;
  }

  _mapKeyToEditorCommand(e) {
    if (e.keyCode === 9) {
      e.preventDefault();
      const newEditorState = RichUtils.onTab(e, this.state.editorState, 4);
      if (newEditorState !== this.state.editorState) this.onChange(newEditorState);
      return;
    }
    return getDefaultKeyBinding(e);
  }

  _toggleBlockType(blockType) { this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType)); }
  _toggleInlineStyle(inlineStyle) { this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)); }

  render() {
    const {editorState} = this.state;

    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root">
        {this.props.name ? <p id="editor-title">{this.props.name}</p> : <></>}
        <BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType} />
        <InlineStyleControls editorState={editorState} onToggle={this.toggleInlineStyle} />
        <hr/>
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.mapKeyToEditorCommand}
            onChange={this.onChange}
            placeholder="Enter text here..."
            ref={ref => { this.editor = ref }}
            spellCheck={true}
          />
        </div>
        <Hidden name={this.props.id} value={this.getContent}/>
      </div>
    );
  }
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  }
};

function getBlockStyle(block) { return block.getType() === 'blockquote' ? 'RichEditor-blockquote' : null; }

const StyleButton = ({ active, label, onToggle, style }) => (
  <span
    className={`RichEditor-styleButton ${active ? 'RichEditor-activeButton' : ''}`}
    onMouseDown={e => { e.preventDefault(); onToggle(style); }}
  >
      {label}
  </span>
);

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'}
];

const BlockStyleControls = ({ editorState, onToggle }) => {
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = ({ editorState, onToggle }) => (
  <div className="RichEditor-controls">
    {INLINE_STYLES.map(type =>
      <StyleButton
        key={type.label}
        active={editorState.getCurrentInlineStyle().has(type.style)}
        label={type.label}
        onToggle={onToggle}
        style={type.style}
      />
    )}
  </div>
);

//
//
// <div class="DraftEditor-editorContainer">
//   <div aria-describedby="placeholder-ask97" class="notranslate public-DraftEditor-content" contenteditable="true" role="textbox" spellcheck="true" style="outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;">
//     <div data-contents="true">
//       <h1 data-block="true" data-editor="ask97" data-offset-key="29llr-0-0">
//         <div data-offset-key="29llr-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//           <span data-offset-key="29llr-0-0">
//             <span data-text="true">asdfasdf</span>
//           </span>
//         </div>
//       </h1>
//       <h2 data-block="true" data-editor="ask97" data-offset-key="4tqhd-0-0">
//         <div data-offset-key="4tqhd-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//           <span data-offset-key="4tqhd-0-0">
//             <span data-text="true">asdf</span>
//           </span>
//         </div>
//       </h2>
//       <h3 data-block="true" data-editor="ask97" data-offset-key="1o1t7-0-0">
//         <div data-offset-key="1o1t7-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//           <span data-offset-key="1o1t7-0-0">
//             <span data-text="true">asdf</span>
//           </span>
//         </div>
//       </h3>
//       <h4 data-block="true" data-editor="ask97" data-offset-key="4p9u-0-0">
//         <div data-offset-key="4p9u-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//           <span data-offset-key="4p9u-0-0">
//             <span data-text="true">asdf</span>
//           </span>
//         </div>
//       </h4>
//     </div>
//   </div>
// </div>
//
// <div class="DraftEditor-editorContainer">
//   <div aria-describedby="placeholder-ask97" class="notranslate public-DraftEditor-content" contenteditable="true" role="textbox" spellcheck="true" style="outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;">
//     <div data-contents="true">
//       <blockquote class="RichEditor-blockquote" data-block="true" data-editor="ask97" data-offset-key="29llr-0-0">
//         <div data-offset-key="29llr-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//           <span data-offset-key="29llr-0-0">
//             <span data-text="true">asdf</span>
//           </span>
//         </div>
//       </blockquote>
//     </div>
//   </div>
// </div>
//
//
// <div class="DraftEditor-editorContainer">
//   <div aria-describedby="placeholder-ask97" class="notranslate public-DraftEditor-content" contenteditable="true" role="textbox" spellcheck="true" style="outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;">
//     <div data-contents="true">
//       <ul class="public-DraftStyleDefault-ul" data-offset-key="29llr-0-0">
//         <li class="public-DraftStyleDefault-unorderedListItem public-DraftStyleDefault-reset public-DraftStyleDefault-depth0 public-DraftStyleDefault-listLTR" data-block="true" data-editor="ask97" data-offset-key="29llr-0-0">
//           <div data-offset-key="29llr-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//             <span data-offset-key="29llr-0-0">
//               <span data-text="true">asdf</span>
//             </span>
//             <span data-offset-key="29llr-0-1" style="background-color: rgba(0, 0, 0, 0.05); font-family: Inconsolata, Menlo, Consolas, monospace; font-size: 16px; padding: 2px;">
//               <span data-text="true">asdf</span>
//             </span>
//           </div>
//         </li>
//       </ul>
//     </div>
//   </div>
// </div>
//
// <div class="DraftEditor-editorContainer">
//   <div aria-describedby="placeholder-ask97" class="notranslate public-DraftEditor-content" contenteditable="true" role="textbox" spellcheck="true" style="outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;">
//     <div data-contents="true">
//       <ul class="public-DraftStyleDefault-ul" data-offset-key="29llr-0-0">
//         <li class="public-DraftStyleDefault-unorderedListItem public-DraftStyleDefault-reset public-DraftStyleDefault-depth0 public-DraftStyleDefault-listLTR" data-block="true" data-editor="ask97" data-offset-key="29llr-0-0">
//           <div data-offset-key="29llr-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
//             <span data-offset-key="29llr-0-0">
//               <span data-text="true">asdf</span>
//             </span>
//             <span data-offset-key="29llr-0-1" style="background-color: rgba(0, 0, 0, 0.05); font-family: Inconsolata, Menlo, Consolas, monospace; font-size: 16px; padding: 2px;">
//               <span data-text="true">asdf</span>
//             </span>
//             <span data-offset-key="29llr-0-2" style="background-color: rgba(0, 0, 0, 0.05); font-family: Inconsolata, Menlo, Consolas, monospace; font-size: 16px; padding: 2px; text-decoration: underline;">
//               <span data-text="true">asdf</span>
//             </span>
//             <span data-offset-key="29llr-0-3" style="background-color: rgba(0, 0, 0, 0.05); font-family: Inconsolata, Menlo, Consolas, monospace; font-size: 16px; padding: 2px; text-decoration: underline; font-style: italic;">
//               <span data-text="true">asdf</span>
//             </span>
//             <span data-offset-key="29llr-0-4" style="background-color: rgba(0, 0, 0, 0.05); font-family: Inconsolata, Menlo, Consolas, monospace; font-size: 16px; padding: 2px; text-decoration: underline; font-style: italic; font-weight: bold;">
//               <span data-text="true">asdf</span>
//             </span>
//           </div>
//         </li>
//       </ul>
//     </div>
//   </div>
// </div>
