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
      title="Setting"
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
          Before you can start using AI Assistant, we need you to provide an API key. Currently, we only support OpenAI, but more support will be coming soon. you can pass{' '}

        </p>

        <br />

        <p>AI Assistant is free if you don't set it up, but it might be unstable</p>

        <br />

        <label>Open API Key</label>
        <Input value={setting.apiKey || ''} onChange={onChangeAPIKey} />
      </div>
    </Modal>
  );
}
