from setuptools import setup, find_packages

setup(
    name='crop-image',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        'Flask',
        'pillow',
        'adb-tool-py>=0.1.2',
    ],
    entry_points={
        'console_scripts': [
            'crop_image=crop_image.crop_image:main',
        ],
    },
    author='Shota Iuchi',
    author_email='shotaiuchi.develop@gmail.com',
    description='Cropping images',
    license='MIT',
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
    ],
    keywords='crop, image, adb, screenshot',
    url='https://github.com/ShotaIuchi/crop-image',
)