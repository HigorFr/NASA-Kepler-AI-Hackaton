# NASA Kepler AI Hackathon

[SITE](https://lovable.dev/projects/550e8452-9330-4b8a-8e27-b745b1e58b24?permissionView=main)

## Overview

This project was developed during the NASA Space Apps Challenge hackathon with the goal of applying machine learning techniques to classify celestial objects. Using publicly available NASA datasets, the system predicts whether a given object is likely to be a planet based on observed characteristics.

The project demonstrates an end-to-end data science workflow, from data analysis and model training to user interaction through a lightweight frontend.

## Problem Statement

NASA missions such as Kepler and TESS generate large volumes of astronomical data. One of the main challenges is distinguishing real exoplanets from false positives or non-planetary objects.

This project addresses this challenge by applying supervised machine learning models to classify celestial objects using structured astronomical data.

## Machine Learning Models

The following models were trained and exported in ONNX format to ensure portability and reproducibility:

- Random Forest (Kepler K2)
  Trained on data from the Kepler K2 mission to classify celestial objects.

- Random Forest (Kepler KOI)
  Focused on classification of Kepler Objects of Interest (KOI).

- LightGBM (TESS)
  Gradient boosting model optimized for performance on TESS mission data.

These models allow comparison between different datasets and machine learning approaches.

## Datasets

The project uses publicly available datasets from NASA missions:

- Kepler Mission
- Kepler K2 Extension
- TESS (Transiting Exoplanet Survey Satellite)

## Frontend

A lightweight frontend was developed using Lovable, enabling interaction with the trained models and visualization of prediction results in a user-friendly interface.

## Technologies Used

- Python – data processing and model training
- Scikit-learn – Random Forest models
- LightGBM – gradient boosting models
- ONNX – model export and interoperability
- Lovable – fast frontend development
- NASA Kepler and TESS open datasets

## Project Context

This project was developed in a hackathon environment, emphasizing rapid prototyping, collaboration, and practical application of machine learning techniques rather than production-level deployment.

## Future Improvements

- Add detailed evaluation metrics and visualizations
- Experiment with additional classification models
- Improve frontend interaction and usability
- Automate data preprocessing and evaluation pipelines

## Acknowledgments

- NASA Space Apps Challenge
- NASA open datasets from the Kepler and TESS missions
