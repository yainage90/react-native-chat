import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { db, createMessage, getCurrentUser } from '../utils/firebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { Alert } from 'react-native';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { MaterialIcons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const SendButton = props => {
  const theme = useContext(ThemeContext);

  return (
    <Send
      {...props}
      disabled={!props.text}
      containerStyle={{
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
      }}
    >
      <MaterialIcons
        name="send"
        size={24}
        color={props.text ? theme.sendButtonActive : theme.sendButtonInactive}
      />
    </Send>
  );
};

const Channel = ({
  navigation,
  route: {
    params: { id, title },
  },
}) => {
  const theme = useContext(ThemeContext);
  const { uid, name, photoURL } = getCurrentUser();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'channels', id, 'messages'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(q, querySnapshot => {
      const list = [];
      querySnapshot.forEach(doc => {
        list.push(doc.data());
      });
      setMessages(list);
    });

    return () => unsub();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: title || 'Channel' });
  }, []);

  const onSend = async messageList => {
    const newMessage = messageList[messageList.length - 1];
    try {
      await createMessage({ channelId: id, message: newMessage });
    } catch (e) {
      console.log(`Send message error. ${e.message}`);
      Alert.alert(`Send message error. ${e.message}`);
    }
  };

  return (
    <Container>
      <GiftedChat
        listViewProps={{
          style: { backgroundColor: theme.background },
        }}
        placeholder="Enter message.."
        messages={messages}
        user={{ _id: uid, name, avatar: photoURL }}
        onSend={onSend}
        alwaysShowSend={true}
        textInputProps={{
          autoCapitalize: 'none',
          autoCorrect: false,
          textContentType: 'none',
          underlineColorAndroid: 'transparent',
        }}
        multiline={false}
        renderUsernameOnMessage={true}
        scrollToBottom={true}
        renderSend={props => <SendButton {...props} />}
        inverted={false}
      />
    </Container>
  );
};

export default Channel;
