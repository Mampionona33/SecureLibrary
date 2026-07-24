import React from 'react';
import BookForm from '../BookForm';

const CreateBookScreen = ({ navigation }: any) => {
  return (
    <BookForm
      navigation={navigation}
      submitLabel="Ajouter le livre"
      onSuccessMsg="Le livre a été créé avec succès."
      isEditing={false}
    />
  );
};

export default CreateBookScreen;
