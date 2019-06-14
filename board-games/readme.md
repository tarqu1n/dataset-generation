# Board Games Data Generation

## steps

- `node script` - this will scrape data from the network requests and save it as `output.json`
- `node parseForUpload` - this will convert the object stored within `output.json` into tsv with a heading row
- `node getImages` - will harvest images for the dataset and save them in an `./images` folder (you may need to create this folder yourself if on windows)
