
import { Editor } from '@monaco-editor/react';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange }) => {
  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || '');
  };

  return (
    <div className="monaco-editor-container">
      <Editor
        height="400px"
        defaultLanguage="yaml"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          contextmenu: true,
          selectOnLineNumbers: true,
          glyphMargin: false,
          folding: true,
          foldingHighlight: true,
          renderLineHighlight: 'all',
          renderWhitespace: 'boundary',
          smoothScrolling: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'on'
        }}
      />
    </div>
  );
};

export default YamlEditor; 