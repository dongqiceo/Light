import './index.less';
import { Tooltip } from 'antd';

const JustifyCenter = {
  "left": "flex-start",
  "center": "center",
  "right": "flex-end",
};

export default (val, options) => {
  return (val !== null && val !== undefined) ? (
    <Tooltip
      trigger={options?.trigger || 'hover'}
      placement={options?.placement || "top"}
      overlayStyle={{ maxWidth: options?.tipWidth || 500 }}
      title={
        <div
          className="scrollbar"
          style={{
            maxHeight: 300,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {options?.breakLine ? val?.replaceAll(';', '\n') : val}
        </div>
      }
    >
      <div style={{ margin: "0 auto", width: "100%", display: "flex", justifyContent: JustifyCenter[options?.textAlign || "center"] }}>
        <div
          style={{
            whiteSpace: 'pre',
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: options?.textWidth || 200,
          }}
        >
          {val}
        </div>
      </div>
    </Tooltip>
  ) : (
    ''
  );
};
