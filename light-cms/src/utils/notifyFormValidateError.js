import { message } from 'antd';

/**
 * validateFields 失败时给出可见反馈（toast）。
 * 若传入 languages，优先提示「语言页签」上的首个错误，并带上【语言名】前缀，
 * 与 LanguageTab.focusFirstError 切页行为对齐。
 */
export function notifyFormValidateError(error, languages) {
  const fields = error?.errorFields || [];
  let target = fields[0];

  if (languages?.length) {
    const langField = fields.find((item) => {
      const name = Array.isArray(item?.name) ? item.name[0] : item?.name;
      return typeof name === 'string' && languages.some((l) => name.startsWith(`${l.code}_`));
    });
    if (langField) target = langField;
  }

  const first = target?.errors?.[0];
  const fieldName = Array.isArray(target?.name) ? target.name[0] : target?.name;
  let langLabel = '';
  if (typeof fieldName === 'string' && languages?.length) {
    const lang = languages.find((l) => fieldName.startsWith(`${l.code}_`));
    if (lang) langLabel = `【${lang.name}】`;
  }

  message.error(langLabel ? `${langLabel}${first}` : (first || '请检查表单填写是否完整'));
  return error?.errorFields;
}
