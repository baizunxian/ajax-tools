import React, { ForwardedRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Select, Space, Dropdown, MenuProps } from 'antd';
import { AlignLeftOutlined, DownOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// editor.all中可查看完整的
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/language/json/monaco.contribution'; // 代码高亮&提示
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js'; // 右键显示菜单
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js'; // 折叠
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js'; // 格式化代码
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js'; // 代码联想提示
import 'monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js'; // 代码联想提示

import './index.css';

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      //   case 'css':
      //   case 'scss':
      //   case 'less':
        //     return new cssWorker();
        //   case 'html':
        //   case 'handlebars':
        //   case 'razor':
        //     return new htmlWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
};

interface MonacoEditorProps {
  languageSelectOptions?: string[];
  editorHeight?: number | string;
  language?: string;
  text?: string;
  examples?: { egTitle?: string, egText: string }[];
}
const MonacoEditor = (props: MonacoEditorProps, ref: ForwardedRef<{ editorInstance: any }>) => {
  const editorRef = useRef(null);
  useImperativeHandle(ref, () => ({
    editorInstance: editor,
  }));
  const {
    languageSelectOptions = ['json', 'javascript'],
    editorHeight = document.body.offsetHeight - 300,
    examples = [{ egTitle: '', egText: 'e.g.' }]
  } = props;
  const [editor, setEditor] = useState<any>(null);
  const [language, setLanguage] = useState<string>(props.language || 'json');
  useEffect(() => {
    if (!editor) {
      const editor = monaco.editor.create(editorRef.current!, {
        value: '',
        language,
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
        tabSize: 2
      });
      setEditor(editor);
    }
  }, []);
  useEffect(() => {
    if (editor) {
      editor.getModel().setValue(props.text || '');
      setTimeout(() => {
        // 格式化代码
        formatDocumentAction();
      }, 300);
    }
  }, [editor, props.text]);

  // 格式化代码
  const formatDocumentAction = () => {
    if (editor) editor.getAction('editor.action.formatDocument').run();
  };

  const onLanguageChange = (_language: string) => {
    if (editor) {
      setLanguage(_language);
      monaco.editor.setModelLanguage(editor.getModel(), _language); // 切换语言
    }
  };

  const onAddExampleClick = (egText: string) => {
    if (editor) editor.getModel().setValue(egText);
  };

  const items: MenuProps['items'] = examples.map((eg: {egTitle?: string, egText: string}, index) => {
    return {
      key: index,
      label: <div onClick={()=>onAddExampleClick(eg.egText)}>{eg.egTitle}</div>,
    };
  });
  return <div className="ajax-tools-monaco-editor-container">
    <header className="ajax-tools-monaco-editor-header">
      <Select
        size="small"
        value={language}
        onChange={onLanguageChange}
        className="ajax-tools-monaco-language-select"
      >
        {
          languageSelectOptions.map((lang) => <Select.Option key={lang} value={lang}>{lang}</Select.Option>)
        }
      </Select>
      <div>
        <Space size={16}>
          {
            examples.length > 1 ? <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space size={4}>
                  Example
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown> : <a
              title="Example Case"
              onClick={() => onAddExampleClick(examples[0].egText)}
            >
              Example
            </a>
          }
          <AlignLeftOutlined
            title="Format Document"
            onClick={formatDocumentAction}
          />
        </Space>
      </div>
    </header>
    <div
      ref={editorRef}
      style={{
        height: editorHeight,
        minHeight: 100
      }}
    />
  </div>;
};
export default React.memo(React.forwardRef(MonacoEditor));
