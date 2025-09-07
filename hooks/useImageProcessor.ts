import { useState, useCallback } from 'react';
import { MAX_IMAGE_DIMENSION } from '../constants';
import heic2any from 'heic2any';

export const useImageProcessor = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const processImageFile = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = image;

        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
            height = MAX_IMAGE_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('2D 컨텍스트를 가져올 수 없습니다.'));
        }
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('캔버스에서 Blob을 생성하지 못했습니다.'));
          }
          const filename = (file.name.split('.').slice(0, -1).join('.') || 'processed') + '.png';
          const convertedFile = new File([blob], filename, { type: 'image/png' });
          resolve(convertedFile);
        }, 'image/png', 0.95);
      };
      image.onerror = (err) => reject(new Error(`이미지 로드 실패: ${err}`));
      image.src = URL.createObjectURL(file);
    });
  }, []);

  const handleImageUpload = useCallback(async (file: File): Promise<File | null> => {
    setProcessingError(null);
    try {
      let fileToProcess = file;
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);

      if (isHeic) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/png",
          quality: 0.95,
        });

        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        if (!finalBlob) {
            throw new Error('HEIC 파일을 변환하지 못했습니다.');
        }

        const filename = (file.name.split('.').slice(0, -1).join('.') || 'converted') + '.png';
        fileToProcess = new File([finalBlob], filename, { type: 'image/png' });
      }

      const processedFile = await processImageFile(fileToProcess);
      setImageFile(processedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
      return processedFile;
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : '알 수 없는 오류';
      setProcessingError(`이미지 처리 중 오류 발생: ${errorMessage}`);
      setImageFile(null);
      setImagePreview(null);
      return null;
    }
  }, [processImageFile]);

  return {
    imageFile,
    imagePreview,
    processingError,
    handleImageUpload,
    setImageFile, // for history selection
    setImagePreview // for history selection
  };
};