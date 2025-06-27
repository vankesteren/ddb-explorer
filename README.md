# Map Explorer

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)

## Overview

This repository contains a Vue.js web application that renders GeoJSON maps with dynamic region coloring. The application imports geographic boundary data in GeoJSON format and applies colors to regions based on external datasets (see `/public`). It can use any GeoJSON as the basis for the map and it can use a dataset to determine the coloring of the region.

Everything runs locally in the browser with [duckdb-wasm](https://github.com/duckdb/duckdb-wasm) as the underlying SQL online analytical processing (OLAP) database.

## Features

- Import custom GeoJSON files for map boundaries
- Upload datasets to determine region coloring
- Browser-based processing with no server required
- Real-time filtering and mapping of very large datasets

## Quick Start

### Online Demo

Visit the GitHub Pages website of this project [here](https://sodascience.github.io/map-explorer/) and check out the example.

You can import your own GeoJSON and data files to determine the coloring of the regions, using the "Import Data". In the datafile make sure that given an applied filtering each row maps a region to value.

### Local Development

**Prerequisites**

- Node.js and npm installed

**Installation**

1. Clone or fork the repository:

```sh
git clone https://github.com/sodascience/map-explorer.git
```

2. Navigate to the project directory:

```sh
cd map-explorer
```

3. Install dependencies:

```sh
npm install
```

4. Start the development server:

```sh
npm run dev
```

## Embedding 

If you want to embed this application into your own website you can do so by including it into an iframe, like so:

```html
<iframe 
  src="https://sodascience.github.io/map-explorer/"
  width="100%" 
  height="800"
  frameborder="0"
  allowfullscreen>
</iframe>
```

## Contact

This is a project by the [ODISSEI Social Data Science (SoDa)](https://odissei-soda.nl) team.

Do you have questions, suggestions, or remarks on the technical implementation? Create an issue in the [issue tracker](https://github.com/sodascience/map-explorer/issues) or feel free to contact [Niek de Schipper](https://github.com/trbknl).

<img src="/public/soda.png" alt="SoDa logo" width="250px"/>
