import React, { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components/native';
import { Input, Button } from '../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Alert } from 'react-native';
import { ProgressContext } from '../contexts';
import { createChannel } from '../utils/firebase';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  justify-content: center;
  align-items: center;
  padding: 0 20px;
`;

const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color: ${({ theme }) => theme.errorText};
`;

const ChannelCreation = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const descriptionRef = useRef();
  const [errorMessage, setErrorMessage] = useState('');
  const [disabled, setDisabled] = useState(true);
  const { spinner } = useContext(ProgressContext);

  useEffect(() => {
    setDisabled(!(title && !errorMessage));
  }, [title, errorMessage]);

  const handleTitleChange = text => {
    setTitle(text.trim());
    setErrorMessage(title.trim() ? '' : '제목을 입력하세요.');
  };

  const handleDescriptionChange = text => {
    setDescription(text.trim());
  };

  const handleCreateButtonPress = async () => {
    spinner.start();
    const id = await createChannel({ title, description });
    navigation.replace('Channel', { id, title });
    spinner.stop();
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1 }}
      extraScrollHeight={20}
    >
      <Container>
        <Input
          label="Title"
          value={title}
          onChangeText={handleTitleChange}
          onSubmitEditing={() => {
            descriptionRef.current.focus();
          }}
          placeholder="Title"
          returnKeyType="next"
          maxLength={20}
        />
        <Input
          ref={descriptionRef}
          label="Description"
          value={description}
          onChangeText={handleDescriptionChange}
          onSubmitEditing={() => {
            handleCreateButtonPress();
          }}
          placeholder="Description"
          returnKeyType="done"
          maxLength={50}
        />
        <ErrorText>{errorMessage}</ErrorText>
        <Button
          title="Create"
          onPress={handleCreateButtonPress}
          disabled={disabled}
        />
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default ChannelCreation;
