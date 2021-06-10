import React, { useState } from 'react';
import { UpOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';
import './style.less';

function FindInPage(props) {
  const [searchValue, setSearchValue] = useState();
  const [isComposition, setIsComposition] = useState(false);
  async function getWebview() {
    const id = await $ipcRenderer.invoke('get-search-view-target-web-content-id');
    if(id) {
      const webContent = window.$remote.webContents.fromId(id);
      return webContent;
    }
  }

  async function findInPage(searchValue) {
    const webContent = await getWebview();
    if (webContent) {
      if (searchValue) {
        webContent.findInPage(searchValue);
      } else {
        webContent.stopFindInPage('keepSelection');
      }
      setSearchValue(searchValue);
    }
  }
  return (
    <div className="client-find-in-page">
      <input
        // value={searchValue}
        className="client-find-in-page_search-input"
        onCompositionStart={(e) => {
          setIsComposition(true);
        }}
        onCompositionEnd={(e) => {
          setIsComposition(false);
          findInPage(e.target.value);
        }}
        onChange={async (e) => {
          if(!isComposition) {
            findInPage(e.target.value);
          }
        }}
      />
      <div className="client-find-in-page_control">
        <div className="client-find-in-page_control-count-info">
          {/* 1/5 */}
        </div>
        <div
          className="client-find-in-page_control-btn"
          onClick={async () => {
            const webContent = await getWebview();
            if (webContent) {
              webContent.findInPage(searchValue, { forward: false });
            }
          }}
        >
          <UpOutlined />
        </div>
        <div
          className="client-find-in-page_control-btn"
          onClick={async () => {
            const webContent = await getWebview();
            if (webContent) {
              webContent.findInPage(searchValue, { forward: true });
            }
          }}
        >
          <DownOutlined />
        </div>
        <div
          className="client-find-in-page_control-btn"
          onClick={async () => {
            const webContent = await getWebview();
            if (webContent) {
              webContent.stopFindInPage('keepSelection');
            }

            window.$ipcRenderer.invoke('close-search-view');
          }}
        >
          <CloseOutlined />
        </div>
      </div>
    </div>
  );
}
export default FindInPage;
