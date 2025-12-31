import { useSignUpPromptContext } from '~/contexts'

export const SignUpPromptModal = () => {
  const { SignUpPromptModal: Modal } = useSignUpPromptContext()
  return <Modal />
}
