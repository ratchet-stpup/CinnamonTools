## make-xlet-pot script description

This is a tool (more precisely, a Python script) to assist in the localization of Cinnamon xlets. It is based on the tool/script shipped with [Cinnamon itself](https://github.com/linuxmint/Cinnamon/blob/master/files/usr/share/cinnamon/cinnamon-json-makepot/cinnamon-json-makepot.py), but with more options to facilitate .pot files creation in a totally automatic way without the need to edit the .pot files manually.

**Note:** I changed its name to **make-xlet-pot** so it doesn't interfere nor it is confused with the original script (**cinnamon-json-makepot**).

## Dependencies

It has the exact same dependencies as the original tool/script. The **polib** Python module.

- **Debian based distributions:** The package to install is called **python3-polib**.
- **Archlinux and Fedora based distributions:** The package to install is called **python-polib**.
- **Installing with pip:** The package to install is called **polib**.

## Differences with the original script

- Use of Python 3 instead of Python 2 on the script itself.
- Possibility to scan Python files.
- Possibility to set a custom header for the .pot file with data automatically generated and/or set through a settings file.
- Possibility to *blacklist* a set of preference keys found inside the **settings-schema.json** file so the generated .pot file doesn't need to be manually edited later.

## Usage

**Note:** This information is also printed into the terminal when the script is executed without arguments of when it is executed with the `-h` or `--help ` arguments.

```shell
make-xlet-pot -i | -r | -a | [-js | -py] -c [-s key1,keyN] [potfile name]
```

### All options should only be run from your xlet directory

- `-j` or `--js`: Runs xgettext on any JavaScript files in your directory before scanning the settings-schema.json and metadata.json files. This allows you to generate a .pot file for your entire xlet at once.
- `-p` or `--py` **(*)**: Same as the previous option, but for Python files.
- `-c` or `--custom-header` **(*)**: It allows to use a custom header for the generated .pot file instead of the one enforced by xgettext that has to be edited manually. Some data is automatically generated and some needs to be specified in a **[settings file]**.

    - **Automatically generated data:**
        - **PACKAGE**: The xlet UUID will be used as the package name.
        - **VERSION**: The xlet version extracted from the metadata.json file (if exists).
        - **COPY_CURRENT_YEAR**: The copyright current year.
        - **TIMESTAMP**: The current date in the format YEAR-MO-DA HO:MI+ZONE.
        - **SCRIPT_VERSION**: This script version.

    - **Data specified in a [settings file]:**
        - **COPY_INITIAL_YEAR**: The copyright year when the .pot file was initially created by the FIRST_AUTHOR.
        - **FIRST_AUTHOR**: The .pot file and/or the xlet creator.
        - **FIRST_AUTHOR_EMAIL**: The e-mail address of the .pot file and/or the xlet creator.
        - **[settings file]**: This file is a .json file with the exact same name of the xlet UUID plus the .json extension. Its content should be a "JSON object" like the following and whose keys are all optional (leave the comments so nobody touches the file):

```json
{
    "__comment1__": "DO NOT DELETE/MOVE/RENAME/EDIT!!!",
    "__comment2__": "Data used to generate the .pot file",
    "FIRST_AUTHOR": "FIRST_AUTHOR",
    "FIRST_AUTHOR_EMAIL": "FIRST_AUTHOR_EMAIL",
    "COPY_INITIAL_YEAR": "COPY_INITIAL_YEAR"
}
```

- `-s key1,key2,keyN` or `--skip-keys key1,key2,keyN` **(*)**: A comma separated list of preference keys as found inside the settings-schema.json file to be ignored by the strings extractor.
- `-a` or `--all` **(*)**: This argument is an "special shortcut". Using this argument is equivalent to using the arguments `--js`, `--py` and `--custom-header` all at the same time. In addition, this argument ignores the **[potfile name]** argument. The pot file name is automatically set to the xlet UUID and its destination will be the "po" folder inside your xlet. If the "po" folder doesn't exists, it will be automatically created.
- `-i` or `--install`: Compiles and installs any .po files contained in a po folder to the system locale store.  Use this option to test your translations locally before uploading to Spices. It will use the xlet UUID as the translation domain.
- `-r` or `--remove`: The opposite of install, removes translations from the store. Again, it uses the UUID to find the correct files to remove.
- **[potfile name]**: Name of the .pot file to work with.  This can be pre-existing,
or the name of a new file to use.  If you leave off the .pot extension, it will
be automatically appended to the file name. If no name is provided, the xlet
UUID will be used as the file name.

**(*)**: Only available on **make-xlet-pot**.
