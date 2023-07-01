import { Modal, Input, ModalProps } from '@chatui/core';
import { useEffect, useState } from 'react';
import { AIChatContextType, useAiChatSetting } from './hooks';
import styles from './ai-chat.module.css';
import { useRouter } from 'next/router';
import config from 'config.json'

type Setting = AIChatContextType['setting'];
export function SettingModal(
  props: ModalProps & {
    onConfirm?: (setting: Setting) => void;
  },
) {
  const defaultSetting = useAiChatSetting();
  const [setting, setSetting] = useState<Setting>(defaultSetting);
  const router = useRouter();

  const onChangeAPIKey = (val: string) => {
    setSetting({
      ...setting,
      apiKey: val,
    });
  }
  useEffect(() => {
    console.log(config, 'co')
    if (router.query.api_key) {
      setSetting({ ...setting, apiKey: String(router.query.api_key) })
    }
    else {
      setSetting({ ...setting, apiKey: String(config.api_key) })
    }
  }, [])

  return (
    // @ts-ignore
    <Modal
      active={props.active}
      title="配置"
      showClose={false}
      onClose={props.onClose}
      actions={[
        {
          label: 'OK',
          onClick: () => {
            props.onConfirm && props.onConfirm(setting);
            props.onClose && props.onClose();
          },
          color: 'primary',
        },
        {
          onClick: props.onClose,
          label: 'Cancel',
        },
      ]}
    >
      <div className={styles.settingContent}>
        <p>
          在你开始使用 AI Assistant 之前，我们需要你提供一个 API 密钥。目前，我们只支持
          OpenAI，但很快就会有更多的支持。你可以通过{' '}

        </p>

        <br />

        <p>如果您不设置，AI Assistant 会提供免费的服务，但是这可能不太稳定</p>

        <br />

        <label>Open API Key</label>
        <Input value={setting.apiKey || ''} onChange={onChangeAPIKey} />
      </div>
    </Modal>
  );
}
