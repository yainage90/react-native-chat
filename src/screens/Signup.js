import React, { useState, useEffect, useContext, useRef } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { Image, Input, Button } from '../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { validateEmail, removeWhitespace } from '../utils/common';
import { images } from '../utils/images';
import { signup } from '../utils/firebase';
import { ProgressContext } from '../contexts';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
  padding: 40px 20px;
`;

const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color: ${({ theme }) => theme.errorText};
`;

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [singupDisabled, setSignupDisabled] = useState(true);
  const [photoURL, setPhotoURL] = useState(images.person);
  const { spinner } = useContext(ProgressContext);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);

  useEffect(() => {
    let errorMessage = '';
    if (!name) {
      errorMessage = '이름을 입력하세요.';
    } else if (!validateEmail(email)) {
      errorMessage = '이메일을 올바른 형식으로 입력하세요.';
    } else if (password.length < 6) {
      errorMessage = '비밀번호는 6자리 이상이어야 합니다.';
    } else if (password !== passwordConfirm) {
      errorMessage = '비밀번호가 일치하지 않습니다.';
    } else {
      errorMessage = '';
    }
    setErrorMessage(errorMessage);
  }, [name, email, password, passwordConfirm]);

  useEffect(() => {
    setSignupDisabled(
      !(name && email && password && passwordConfirm && !errorMessage),
    );
  }, [name, email, password, passwordConfirm, errorMessage]);

  const handleSignupButtonPress = async () => {
    try {
      spinner.start();
      const user = await signup({ email, password, name, photoURL });
      console.log(
        `name=${user.displayName}\nemail=${user.email}\nphotoURL=${user.photoURL}`,
      );
    } catch (e) {
      console.error(`Singup failed.\n${e.message}`);
    } finally {
      spinner.stop();
    }
  };

  return (
    <KeyboardAwareScrollView extraScrollHeight={20}>
      <Container>
        <Image
          rounded={true}
          url={photoURL}
          showButton={true}
          onChangeImage={url => {
            setPhotoURL(url);
          }}
        />
        <Input
          label="이름"
          value={name}
          onChangeText={text => setName(text.trim())}
          onSubmitEditing={() => {
            emailRef.current.focus();
          }}
          placeholder="이름"
          returnKeyType="next"
        />
        <Input
          label="이메일"
          value={email}
          onChangeText={text => setEmail(removeWhitespace(text.trim()))}
          onSubmitEditing={() => {
            passwordRef.current.focus();
          }}
          placeholder="이메일"
          returnKeyType="next"
          ref={emailRef}
        />
        <Input
          label="비밀번호"
          value={password}
          onChangeText={text => setPassword(removeWhitespace(text.trim()))}
          onSubmitEditing={() => {
            passwordConfirmRef.current.focus();
          }}
          placeholder="비밀번호"
          returnKeyType="next"
          isPassword={true}
          ref={passwordRef}
        />
        <Input
          label="비밀번호 확인"
          value={passwordConfirm}
          onChangeText={text =>
            setPasswordConfirm(removeWhitespace(text.trim()))
          }
          placeholder="비밀번호 확인"
          returnKeyType="done"
          isPassword={true}
          ref={passwordConfirmRef}
        />
        <ErrorText>{errorMessage}</ErrorText>
        <Button
          title="가입"
          onPress={handleSignupButtonPress}
          disabled={singupDisabled}
        />
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default Signup;
