#!/bin/bash

# Clear the screen
clear

# Read the block name from the user input
echo -n "Enter block name (CamelCase): "
read block_name

if [ -z "$block_name" ]; then
    echo "Block name is required"
    exit 1
fi

# Transform the first letter of the block name to uppercase
block_name=$(echo $block_name | tr '[:lower:]' '[:upper:]' | cut -c1)$(echo $block_name | cut -c2-)

# Transform the block name to lowercase
block_name_lower=$(echo $block_name | tr '[:upper:]' '[:lower:]')

# Transform the name to caterpillar-case
block_name_caterpillar=$(echo $block_name | sed -r 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')

# Transofmr the name to snake_case
block_name_snake=$(echo $block_name | sed -r 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]' | tr '_' '-')

# Read the description of the block from the user input
echo -n "Enter block description: "
read block_description

if [ -z "$block_description" ]; then
    echo "Block description is required"
    exit 1
fi

# Read if the block requires locale files
echo -n "Does the block require locale files? (y/n): "
read block_locale

if [ -z "$block_locale" ]; then
    echo "Block locale is required"
    exit 1
fi

# Check whether the block_locale is y or n
if [ "$block_locale" != "y" ] && [ "$block_locale" != "n" ]; then
    echo "Block locale must be y or n"
    exit 1
fi

# Check if the block directory already exists
if [ -d "src/blocks/$block_name" ]; then
    echo "Block already exists. Please choose a different block name."
    exit 1
fi

# Create the block directory
mkdir "src/blocks/$block_name"

# Create the block files
touch "src/blocks/$block_name/index.js"
touch "src/blocks/$block_name/$block_name.jsx"
touch "src/blocks/$block_name/$block_name_caterpillar.scss"

# Add the block to the block index file
echo "export * from './$block_name.jsx';" >> "src/blocks/$block_name/index.js"

# Add the block to the block group index file
echo "export * from './$block_name';" >> "src/blocks/index.js"

# Create the locale file if block_locales is y
if [ "$block_locale" == "y" ]; then
    mkdir "src/blocks/$block_name/locales"

    touch "src/blocks/$block_name/locales/en.json"
    echo "{}" >> "src/blocks/$block_name/locales/en.json"

    touch "src/blocks/$block_name/locales/kk.json"
    echo "{}" >> "src/blocks/$block_name/locales/kk.json"

    touch "src/blocks/$block_name/locales/ru.json"
    echo "{}" >> "src/blocks/$block_name/locales/ru.json"

    touch "src/blocks/$block_name/locales/uk.json"
    echo "{}" >> "src/blocks/$block_name/locales/uk.json"

    touch "src/blocks/$block_name/locales/pl.json"
    echo "{}" >> "src/blocks/$block_name/locales/pl.json"

    touch "src/blocks/$block_name/locales.js"
    echo "export * as en from './locales/en.json';" >> "src/blocks/$block_name/locales.js"
    echo "export * as kk from './locales/kk.json';" >> "src/blocks/$block_name/locales.js"
    echo "export * as ru from './locales/ru.json';" >> "src/blocks/$block_name/locales.js"
    echo "export * as uk from './locales/uk.json';" >> "src/blocks/$block_name/locales.js"
    echo "export * as pl from './locales/pl.json';" >> "src/blocks/$block_name/locales.js"

    echo "export * as $block_name from './$block_name/locales.js';" >> "src/blocks/locales.js"
fi

# Add the block to the main block file
echo "import React from 'react';
`
if [ "$block_locale" = "y" ]; then
    echo "import { useTranslation } from 'react-i18next'; "
fi
`

import { Block } from '@USupport-components-library/src';

import './$block_name_caterpillar.scss';

/**
 * $block_name
 *
 * $block_description
 *
 * @return {jsx}
 */
export const $block_name = () => {
`
if [ "$block_locale" = "y" ]; then
    echo "const { t } =  useTranslation('$block_name_snake'); "
fi
`
  return (
    <Block classes='$block_name_caterpillar'>
      $block_name Block
    </Block>
  );
};" >> "src/blocks/$block_name/$block_name.jsx"

# Add the theme to the block styles file
echo "@import '@USupport-components-library/styles';

.$block_name_caterpillar{
}" >> "src/blocks/$block_name/$block_name_caterpillar.scss"

# Output to the user's console
echo "Successfully created $block_name into src/blocks/$block_name"