import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { Button, Image, Input } from '../components';
import { getCurrentUser, logout, updatePhotoURL } from '../utils/firebase';
import { UserContext, ProgressContext } from '../contexts';
import { Text, Alert } from 'react-native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  justify-content: center;
  align-items: center;
  padding: 0 20px;
`;

const Profile = () => {
  const { user, dispatch } = useContext(UserContext);
  const { spinner } = useContext(ProgressContext);
  const theme = useContext(ThemeContext);

  const handleLogoutButton = async () => {
    spinner.start();
    await logout()
      .then(() => {
        dispatch({});
      })
      .catch(e => {
        console.error(`Logout failed.\n${e.message}`);
      })
      .finally(() => {
        spinner.stop();
      });
  };

  const handlePhotoChange = async photoURL => {
    spinner.start();
    const updatedPhotoURL = await updatePhotoURL(photoURL);
    console.log(`updated photoURL=${updatedPhotoURL}`);
    dispatch(getCurrentUser());
    spinner.stop();
  };

  return (
    <Container>
      <Image
        url={user.photoURL}
        onChangeImage={handlePhotoChange}
        showButton={true}
        rounded={true}
      />
      <Input label="Name" value={user.name} disabled />
      <Input label="Email" value={user.email} disabled />
      <Button
        title="logout"
        onPress={handleLogoutButton}
        containerStyle={{ marginTop: 30, backgroundColor: theme.buttonLogout }}
      />
    </Container>
  );
};

export default Profile;
