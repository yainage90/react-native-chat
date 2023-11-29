import React, { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components/native';
import { Image, Input, Button } from '../components';
import { images } from '../utils/images';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { validateEmail, removeWhitespace } from '../utils/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login, getCurrentUser } from '../utils/firebase';
import { ProgressContext, UserContext } from '../contexts';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
  padding: 0 20px;
  padding-top: ${({ insets: { top } }) => top}px;
  padding-bottom: ${({ insets: { bottom } }) => bottom}px;
`;

const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color: ${({ theme }) => theme.errorText};
`;

const Login = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { spinner } = useContext(ProgressContext);
  const { dispatch } = useContext(UserContext);

  const handleSignupPress = () => {
    navigation.navigate('Signup');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loginDisabled, setLoginDisabled] = useState(true);
  const passwordRef = useRef();

  useEffect(() => {
    setLoginDisabled(!(email && password && !errorMessage));
  }, [email, password, errorMessage]);

  const handleEmailChange = text => {
    text = removeWhitespace(text);
    setEmail(text);
    isValidEmail = validateEmail(text);
    if (isValidEmail) {
      setErrorMessage('');
    } else {
      setErrorMessage('올바른 이메일 형식이 아닙니다.');
    }
  };

  const handlePasswordChange = text => {
    setPassword(removeWhitespace(text));
  };

  const handleLoginButtonPress = async () => {
    try {
      spinner.start();
      const user = await login({ email, password });
      dispatch(getCurrentUser());
    } catch (e) {
      console.log(e);
    } finally {
      spinner.stop();
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1 }}
      extraScrollHeight={20}
    >
      <Container insets={insets}>
        <Image url={images.logo} imageStyle={{ borderRadius: 50 }} />
        <Input
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          onSubmitEditing={() => {
            passwordRef.current.focus();
          }}
          placeholder="Email"
          returnKeyType="next"
        />
        <ErrorText>{errorMessage}</ErrorText>
        <Input
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          onSubmitEditing={handleLoginButtonPress}
          placeholder="Password"
          returnKeyType="done"
          isPassword={true}
          ref={passwordRef}
        />
        <Button
          title="Login"
          onPress={handleLoginButtonPress}
          disabled={loginDisabled}
        />
        <Button
          title="Singup with email"
          onPress={handleSignupPress}
          isFilled={false}
        />
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default Login;
