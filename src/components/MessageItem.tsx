import React from 'react';
import { Message } from '../types';
import { formatTime, escapeHtml, parseAnswerAndImages, extractAllImages, normalizeUrl } from '../utils/helpers';
import './MessageItem.scss';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // 解析答案和图片
  const { text, images: blockImages } = parseAnswerAndImages(message.text);
  const looseImages = extractAllImages(message.text);

  // 合并所有图片（去重）
  const allImages = Array.from(new Set([...blockImages, ...looseImages]));

  const renderProgress = () => {
    if (!message.progress) return null;

    const { doneList, runningList, status } = message.progress;

    // 已完成且没有进度，不显示进度条
    if (status === 'completed' && doneList.length === 0 && runningList.length === 0) return null;

    const statusMap: Record<string, string> = {
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
      pending: '等待中',
    };
    const displayStatus = statusMap[status] || status || 'unknown';


    return (
      <details className="progress" open={status !== 'completed'}>
        <summary>
          阶段进度（已完成{doneList.length}，进行中{runningList.length}，状态：{displayStatus}）
        </summary>
        <ul>
          {doneList.map((item, idx) => (
            <li key={`done-${idx}`}>✅ {escapeHtml(item)}</li>
          ))}
          {runningList.map((item, idx) => (
            <li key={`running-${idx}`}>⏳ {escapeHtml(item)}</li>
          ))}
          {doneList.length === 0 && runningList.length === 0 && (
            <li>暂无进度</li>
          )}
        </ul>
      </details>
    );
  };

  const renderTypingIndicator = () => {
    if (message.progress && message.progress.status === 'processing') {
      return (
        <span className="typing">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </span>
      );
    }
    return null;
  };

  const renderImages = () => {
    if (allImages.length === 0) return null;

    return (
      <div className="answer-images">
        {allImages.map((url, idx) => (
          <React.Fragment key={idx}>
            <img
              src={normalizeUrl(url)}
              alt="参考图片"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* <a
              href={normalizeUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a> */}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className={`msg ${isUser ? 'user' : 'bot'}`}>
      {!isUser && <div className="avatar bot">掌库</div>}
      <div>
        <div className="bubble">
          {renderProgress()}
          {renderTypingIndicator()}
          <div className="answer-text">{text}</div>
          {renderImages()}
        </div>
        <div className="meta">{formatTime(message.timestamp)}</div>
      </div>
      {isUser && <div className="avatar">我</div>}
    </div>
  );
};

export default MessageItem;
