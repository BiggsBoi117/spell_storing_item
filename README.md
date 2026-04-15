# Spell Storing Item

The name is inspired by a magic item from Dungeons and Dragons that holds spell charges.

## Structure

The app has a backend (typescript server) and front end (vite formatted react/typescript)

The frontend makes api calls both to the backend (SQLite) and to an external api (D&D 5e api)

## Startup

To run the dev version, a bash module called concurrently will be installed with _npm install_
Concurrently is set up with a script to start both the frontend and backend.

The first time the backend starts up, it will make an empty SQLite database with two tables: _spell classes_ and _my spells_

Navigate to "Admin" via navbar or hamburger menu and run the sync feature. This will run a one time script to populate the _spell classes_ table.

## Use

Once the _spell classes_ table is populated, you can navigate to search to search a spell by name or filter by class.

Clicking on a spell will fetch from the D&D API the spell's information and expand the card to display the fetched info in a dropdown.

You can also add any spell from the search results to your "spellbook". Navigate to "My Spellbook" afterwards and you will see the spells in a readily accesible list.
The add button adds the bare minimum search params to the _my spells_ table.
