#!/usr/bin/env python3
"""
Advanced Skin Analysis Model Training Script
Trains high-accuracy models for skin health and age prediction
"""

import os
import numpy as np
import cv2
import json
import requests
from typing import List, Tuple, Dict, Any
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
from PIL import Image
import io
import base64

class SkinModelTrainer:
    def __init__(self):
        self.skin_health_model = None
        self.age_model = None
        self.age_quantile_model = None
        self.scaler = StandardScaler()
        
        # Create models directory
        os.makedirs('models', exist_ok=True)
        
        # Azure Face API configuration for age data collection
        self.azure_endpoint = os.getenv('AZURE_FACE_ENDPOINT', 'https://your-face-api.cognitiveservices.azure.com/')
        self.azure_key = os.getenv('AZURE_FACE_API_KEY', 'your-api-key')
    
    def create_skin_health_model(self) -> keras.Model:
        """Create a high-accuracy CNN model for skin health prediction"""
        model = keras.Sequential([
            # Input layer
            layers.Input(shape=(224, 224, 3)),
            
            # Data augmentation
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.1),
            layers.RandomBrightness(0.1),
            layers.RandomContrast(0.1),
            
            # Convolutional layers with advanced architecture
            layers.Conv2D(32, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(32, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(64, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(64, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(128, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(128, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(256, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(256, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(512, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.GlobalAveragePooling2D(),
            
            # Dense layers with advanced regularization
            layers.Dense(1024, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Output layer for 6 skin health parameters
            layers.Dense(6, activation='sigmoid', name='skin_health_output')
        ])
        
        # Advanced optimizer with learning rate scheduling
        initial_learning_rate = 0.001
        lr_schedule = keras.optimizers.schedules.ExponentialDecay(
            initial_learning_rate,
            decay_steps=1000,
            decay_rate=0.96,
            staircase=True
        )
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=lr_schedule),
            loss='mse',
            metrics=['mae', 'accuracy']
        )
        
        return model

    def _make_quantile_loss(self, quantiles):
        """Pinball loss for multiple quantiles at once.
        y_true: (batch, ) or (batch, 1)
        y_pred: (batch, len(quantiles))
        """
        qs = tf.constant(quantiles, dtype=tf.float32)

        def quantile_loss(y_true, y_pred):
            y_true = tf.cast(y_true, tf.float32)
            if tf.rank(y_true) == 2 and tf.shape(y_true)[-1] == 1:
                y_true_exp = y_true
            else:
                y_true_exp = tf.expand_dims(y_true, axis=-1)
            e = y_true_exp - y_pred
            loss = tf.maximum(qs * e, (qs - 1.0) * e)
            return tf.reduce_mean(loss)

        return quantile_loss

    def create_age_quantile_model(self) -> keras.Model:
        """Create age quantile model predicting q10, q50, q90 in one head."""
        inputs = keras.Input(shape=(224, 224, 3))
        x = layers.RandomFlip("horizontal")(inputs)
        x = layers.RandomRotation(0.05)(x)
        x = layers.RandomZoom(0.05)(x)
        x = layers.RandomBrightness(0.05)(x)
        x = layers.RandomContrast(0.05)(x)

        for filters in [32, 32]:
            x = layers.Conv2D(filters, 3, activation='relu', padding='same')(x)
            x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.25)(x)

        for filters in [64, 64]:
            x = layers.Conv2D(filters, 3, activation='relu', padding='same')(x)
            x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.25)(x)

        for filters in [128, 128]:
            x = layers.Conv2D(filters, 3, activation='relu', padding='same')(x)
            x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.25)(x)

        for filters in [256, 256]:
            x = layers.Conv2D(filters, 3, activation='relu', padding='same')(x)
            x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.25)(x)

        x = layers.Conv2D(512, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.GlobalAveragePooling2D()(x)

        x = layers.Dense(1024, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.5)(x)

        x = layers.Dense(512, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.5)(x)

        x = layers.Dense(256, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)

        outputs = layers.Dense(3, activation='linear', name='age_quantiles')(x)
        model = keras.Model(inputs=inputs, outputs=outputs)

        initial_learning_rate = 0.001
        lr_schedule = keras.optimizers.schedules.ExponentialDecay(
            initial_learning_rate,
            decay_steps=1000,
            decay_rate=0.96,
            staircase=True
        )

        qloss = self._make_quantile_loss([0.1, 0.5, 0.9])
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=lr_schedule),
            loss=qloss,
            metrics=['mae']
        )

        return model
    
    def create_age_model(self) -> keras.Model:
        """Create age prediction model with high accuracy"""
        model = keras.Sequential([
            layers.Input(shape=(224, 224, 3)),
            
            # Data augmentation
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.05),
            layers.RandomZoom(0.05),
            layers.RandomBrightness(0.05),
            layers.RandomContrast(0.05),
            
            # Advanced CNN architecture
            layers.Conv2D(32, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(32, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(64, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(64, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(128, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(128, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(256, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(256, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            layers.Dropout(0.25),
            
            layers.Conv2D(512, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.GlobalAveragePooling2D(),
            
            # Dense layers
            layers.Dense(1024, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Age prediction (0-100)
            layers.Dense(1, activation='linear', name='age_output')
        ])
        
        # Advanced optimizer
        initial_learning_rate = 0.001
        lr_schedule = keras.optimizers.schedules.ExponentialDecay(
            initial_learning_rate,
            decay_steps=1000,
            decay_rate=0.96,
            staircase=True
        )
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=lr_schedule),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def generate_synthetic_data(self, num_samples: int = 10000) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generate synthetic training data for demonstration purposes"""
        print(f"Generating {num_samples} synthetic training samples...")
        
        # Generate synthetic images (in real scenario, you'd use actual skin images)
        images = []
        skin_health_labels = []
        age_labels = []
        
        for i in range(num_samples):
            # Create synthetic skin-like image
            img = np.random.randint(100, 200, (224, 224, 3), dtype=np.uint8)
            
            # Add some texture and variation
            noise = np.random.normal(0, 20, (224, 224, 3))
            img = np.clip(img + noise, 0, 255).astype(np.uint8)
            
            # Add some skin-like patterns
            for _ in range(np.random.randint(5, 15)):
                center = (np.random.randint(50, 174), np.random.randint(50, 174))
                color = np.random.randint(120, 180, 3)
                cv2.circle(img, center, np.random.randint(2, 8), color.tolist(), -1)
            
            images.append(img)
            
            # Generate realistic skin health labels (0-1 range)
            skin_health = [
                np.random.beta(2, 2),  # hydration
                np.random.beta(2, 2),  # elasticity
                np.random.beta(2, 2),  # texture
                np.random.beta(2, 2),  # pigmentation
                np.random.beta(1, 3),  # inflammation (skewed towards lower values)
                np.random.beta(2, 2),  # collagen
            ]
            skin_health_labels.append(skin_health)
            
            # Generate realistic age labels (18-80)
            age = np.random.normal(35, 15)
            age = np.clip(age, 18, 80)
            age_labels.append(age)
        
        return np.array(images), np.array(skin_health_labels), np.array(age_labels)

    def load_utkface_dataset(self, dataset_dir: str, limit: int = None) -> Tuple[np.ndarray, np.ndarray]:
        """Load UTKFace dataset where filenames are in the format age_gender_race_date.jpg
        Returns (X_images, y_age). Images are resized to 224x224 and normalized to [0,1].
        """
        images: List[np.ndarray] = []
        ages: List[float] = []
        if not os.path.isdir(dataset_dir):
            raise FileNotFoundError(f"UTKFace directory not found: {dataset_dir}")

        count = 0
        for fname in os.listdir(dataset_dir):
            if not (fname.lower().endswith('.jpg') or fname.lower().endswith('.jpeg') or fname.lower().endswith('.png')):
                continue
            try:
                # Parse age from filename
                age_str = fname.split('_')[0]
                age = float(age_str)
                # Load image
                path = os.path.join(dataset_dir, fname)
                img = cv2.imread(path)
                if img is None:
                    continue
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (224, 224))
                images.append(img.astype(np.float32) / 255.0)
                ages.append(np.clip(age, 0, 100))
                count += 1
                if limit and count >= limit:
                    break
            except Exception:
                continue
        if not images:
            raise RuntimeError("No images loaded from UTKFace directory.")
        return np.stack(images, axis=0), np.array(ages, dtype=np.float32)
    
    def get_azure_age_data(self, image_paths: List[str]) -> List[int]:
        """Get age data from Azure Face API for real images"""
        ages = []
        
        for image_path in image_paths:
            try:
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                
                # Azure Face API request
                url = f"{self.azure_endpoint}/face/v1.0/detect"
                headers = {
                    'Content-Type': 'application/octet-stream',
                    'Ocp-Apim-Subscription-Key': self.azure_key
                }
                params = {
                    'returnFaceAttributes': 'age',
                    'returnFaceId': 'false'
                }
                
                response = requests.post(url, headers=headers, params=params, data=image_data)
                
                if response.status_code == 200:
                    faces = response.json()
                    if faces:
                        age = int(faces[0]['faceAttributes']['age'])
                        ages.append(age)
                    else:
                        ages.append(30)  # Default age if no face detected
                else:
                    ages.append(30)  # Default age on API error
                    
            except Exception as e:
                print(f"Error processing {image_path}: {e}")
                ages.append(30)  # Default age on error
        
        return ages
    
    def train_skin_health_model(self, X: np.ndarray, y: np.ndarray, epochs: int = 100):
        """Train the skin health prediction model"""
        print("Training skin health model...")
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Create model
        self.skin_health_model = self.create_skin_health_model()
        
        # Callbacks for better training
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            callbacks.ModelCheckpoint(
                'models/skin_health_model.h5',
                monitor='val_loss',
                save_best_only=True
            )
        ]
        
        # Train model
        history = self.skin_health_model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks_list,
            verbose=1
        )
        
        # Evaluate model
        val_loss, val_mae, val_acc = self.skin_health_model.evaluate(X_val, y_val, verbose=0)
        print(f"Skin Health Model - Validation Loss: {val_loss:.4f}, MAE: {val_mae:.4f}, Accuracy: {val_acc:.4f}")
        
        return history

    def train_age_quantile_model(self, X: np.ndarray, y: np.ndarray, epochs: int = 100):
        """Train quantile age model to output predictive intervals (q10,q50,q90)."""
        print("Training quantile age model...")

        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.age_quantile_model = self.create_age_quantile_model()

        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            callbacks.ModelCheckpoint(
                'models/age_model_quantile.h5',
                monitor='val_loss',
                save_best_only=True
            )
        ]

        history = self.age_quantile_model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks_list,
            verbose=1
        )

        val_loss, val_mae = self.age_quantile_model.evaluate(X_val, y_val, verbose=0)
        print(f"Quantile Age Model - Validation Loss: {val_loss:.4f}, MAE: {val_mae:.4f}")

        return history
    
    def train_age_model(self, X: np.ndarray, y: np.ndarray, epochs: int = 100):
        """Train the age prediction model"""
        print("Training age prediction model...")
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Create model
        self.age_model = self.create_age_model()
        
        # Callbacks for better training
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            callbacks.ModelCheckpoint(
                'models/age_model.h5',
                monitor='val_loss',
                save_best_only=True
            )
        ]
        
        # Train model
        history = self.age_model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks_list,
            verbose=1
        )
        
        # Evaluate model
        val_loss, val_mae = self.age_model.evaluate(X_val, y_val, verbose=0)
        print(f"Age Model - Validation Loss: {val_loss:.4f}, MAE: {val_mae:.4f}")
        
        return history
    
    def save_models(self):
        """Save trained models"""
        if self.skin_health_model:
            self.skin_health_model.save('models/skin_health_model.h5')
            print("Skin health model saved")
        
        if self.age_model:
            self.age_model.save('models/age_model.h5')
            print("Age model saved")
        
        if self.age_quantile_model:
            self.age_quantile_model.save('models/age_model_quantile.h5')
            print("Quantile age model saved")
    
    def train_all_models(self, num_samples: int = 10000, epochs: int = 100):
        """Train all models with synthetic data"""
        print("Starting model training...")
        
        # Generate synthetic data
        X, y_skin_health, y_age = self.generate_synthetic_data(num_samples)
        
        # Normalize images
        X = X.astype(np.float32) / 255.0
        
        # Train skin health model
        self.train_skin_health_model(X, y_skin_health, epochs)
        
        # Train age model
        self.train_age_model(X, y_age, epochs)
        
        # Train age quantile model for predictive intervals
        self.train_age_quantile_model(X, y_age, epochs)
        
        # Save models
        self.save_models()
        
        print("Model training completed!")

def main():
    """Main training function"""
    trainer = SkinModelTrainer()
    # If UTKFACE_DIR env var set, train on real dataset; else fall back to synthetic
    utk_dir = os.getenv('UTKFACE_DIR')
    if utk_dir and os.path.isdir(utk_dir):
        print(f"Loading UTKFace dataset from {utk_dir} ...")
        X_age, y_age = trainer.load_utkface_dataset(utk_dir)
        # For skin health model, we don't have labels in UTKFace; use synthetic for that head
        X_synth, y_skin_health, _ = trainer.generate_synthetic_data(num_samples=min(5000, len(X_age)))
        X_synth = X_synth.astype(np.float32) / 255.0

        # Train models
        trainer.train_skin_health_model(X_synth, y_skin_health, epochs=50)
        trainer.train_age_model(X_age, y_age, epochs=50)
        trainer.train_age_quantile_model(X_age, y_age, epochs=50)
        trainer.save_models()
    else:
        # Train models with synthetic data
        trainer.train_all_models(num_samples=10000, epochs=100)
    
    print("Training completed successfully!")
    print("Models saved in 'models/' directory")

if __name__ == "__main__":
    main()
