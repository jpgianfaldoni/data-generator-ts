
import Editor from '@monaco-editor/react';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange }) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className="yaml-editor">
      <Editor
        height="500px"
        language="yaml"
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
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
};

export default YamlEditor; 