# ML Model Integration Guide

## Model File Location
Place your trained crop disease detection model here:
- `crop_disease_model.h5` (Keras/TensorFlow)
- Or `crop_disease_model.pkl` (scikit-learn)
- Or any other format

## Integration Steps

1. **Install Required Libraries**
   ```bash
   pip install tensorflow keras numpy pillow
   # or
   pip install scikit-learn numpy pillow
   ```

2. **Update `detect_disease()` function in `app.py`**
   
   Example for TensorFlow/Keras:
   ```python
   from tensorflow import keras
   import numpy as np
   from PIL import Image
   
   def detect_disease(image_path, crop_type):
       # Load model
       model = keras.models.load_model('model/crop_disease_model.h5')
       
       # Preprocess image
       img = Image.open(image_path)
       img = img.resize((224, 224))  # Adjust based on your model
       img_array = np.array(img) / 255.0
       img_array = np.expand_dims(img_array, axis=0)
       
       # Predict
       prediction = model.predict(img_array)
       class_index = np.argmax(prediction[0])
       
       # Map to disease name
       disease = get_disease_name(class_index, crop_type)
       
       return format_disease_result(disease, crop_type)
   ```

3. **Model Requirements**
   - Input size: 224x224 (or your model's requirement)
   - Output: Disease class probabilities
   - Supported crops: Cotton, Wheat, Rice, Tomato, Potato

4. **Test the Model**
   - Upload test images
   - Verify predictions match expected diseases

## Current Status
Currently using mock data. Replace `detect_disease_mock()` with actual model inference.

