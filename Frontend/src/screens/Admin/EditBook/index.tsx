import React from 'react';
import BookForm from '../BookForm';

const EditBookScreen = ({ route, navigation }: any) => {
  const { bookId } = route.params;

  return (
    <BookForm
      navigation={navigation}
      bookId={bookId}
      submitLabel="Mettre à jour le livre"
      onSuccessMsg="Le livre a été modifié avec succès."
      isEditing={true}
    />
  );
};

export default EditBookScreen;
