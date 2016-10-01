# Various How-tos about basic tasks

# Git

## How to create a new repository on the command line

```shell
echo "# RepositoryName" >> README.md
git init
git add README.md
git commit -m "Initial commit."
git remote add origin https://github.com/User/RepositoryName.git
git push -u origin master
```

## How to push an existing repository from the command line

```shell
git remote add origin https://github.com/User/RepositoryName.git
git push -u origin master
```

## Avoid user/password prompts

Extracted from [StackOverflow](http://stackoverflow.com/questions/8588768/git-push-username-password-how-to-avoid).

### Generate an SSH key

#### Linux/Mac

Open terminal to create ssh keys:

```shell
cd ~                 # Your home directory
ssh-keygen -t rsa    # Press enter for all values
```

#### For Windows

(Only works if the commit program is capable of using certificates/private & public ssh keys)

- Use Putty Gen to generate a key
- Export the key as an open SSH key

Here is a [walkthrough](http://ask-leo.com/how_do_i_create_and_use_public_keys_with_ssh.html) on putty gen for the above steps

### Associate the SSH key with the remote repository

This step varies, depending on how your remote is set up.

- If it is a GitHub repository and you have administrative privileges, go to settings and click 'add SSH key'. Copy the contents of your ~/.ssh/id_rsa.pub into the field labeled 'Key'.

- If your repository is administered by somebody else, give the administrator your id_rsa.pub.

### Set your remote URL to a form that supports SSH 1

If you have done the steps above and are still getting the password prompt, make sure your repo URL is in the form...

`git+ssh://git@github.com/user_name/repo_name.git`

...as opposed to...

`https://github.com/user_name/repo_name.git`

To see your repo current URL, run:

```shell
git remote show origin
```

You can change the URL with:

```shell
git remote set-url origin git+ssh://git@github.com/user_name/repo_name.git
```

### Summarized steps for Linux

#### 1. Create the SSH keys

```shell
ssh-keygen -t rsa -f ~/.ssh/file_name -b 4096 -C "Comment"
```

It will ask for passphrase and then create the files **~/.ssh/file_name** and **~/.ssh/file_name.pub**.

#### 2. Add the public key **~/.ssh/file_name.pub** to GitHub account SSH section.

#### 3. Add the private key to ssh-agent

```shell
ssh-add ~/.ssh/file_name
```

#### 4. Add remote url to your local git repository

```shell
git remote set-url origin git+ssh://git@github.com/user_name/repo_name.git
```

***

# How to localize xlets

**Note:** I will use the word **xlet** to refer to any Cinnamon applet, extension or desklet.

### Some technical facts

These *facts* are based on documentations and source code that I read.

- .po files can be added to a "po" folder in your xlet's directory, and will be compiled and installed into the system when the xlet is installed via Cinnamon Settings.
- If the xlet is installed manually and not trough Cinnamon Settings, localizations can be installed with the command `cinnamon-json-makepot -i ./po/*` executed from a terminal opened inside the xlet's folder. Assuming that a folder called **po** with .po files exists inside the xlet's folder.
- Most xlets with support for localizations comes with a template file (a .pot file) that can be used to create .po files. But, in case that a .pot file isn't available, an existent .po file can be copied and renamed and then make the translations on that newly created file.

### How to create localization files (.po files)

The easiest (and safer) way would be using [Poedit](https://poedit.net/). This program can be installed from the repositories of almost all Linux distributions and also can be installed on Windows and OS X.

**Note:** .po and .pot files are simply text files. They could be edited manually with a text editor, but I will only explain .po and .pot files manupulation using Poedit. Editing .po files manually could lead to errors that would render the .po file useless. And a .pot file should never be edited by other than the xlet's developer.

#### Poedit usage

###### Creating a translation file from scratch

- Open Poedit and click on **Create new translation**.
    - Open a .pot file if it was made available for the xlet. This file is created by the xlet developer from the source code of the xlet. Therefore, this file will be the most up-to-date and will contain the most amount of strings to translate from.
    - If no .pot file if available, any .po file containing any locale can be used to create a new translation (.po file).
- Once the file is loaded, Poedit will ask you to choose a language for the translation.
- At this point, the .po file can be saved and the name will automatically reflect the locale code.
- Poedit usage is pretty much straight forward:
    - There is the **Source text** box that contains the string to be translated (usually in English).
    - There is the **Translation** box that will contain the translated text.
    - There is a button called **Add comment** that will allow you to add comments for other translators to read. **Never delete comments!!!**
    - If there is a .mo file saved when you save your .po file, the .mo file can be deleted (it isn't used by Cinnamon xlets). You could also disable MO files creation from Poedit preferences (go to **Edit** > **Preferences** > **General** tab and uncheck the option called **Automatically compile MO file when saving**).

###### Updating and existing translation file

- Open the .po file with Poedit.
- Go to the menu **Catalog** and choose **Update from POT file...** menu item.
- Select a .pot file from which your .po file was based on.
- You will be presented with a window with 2 lists (**New strings** and **Obsolete strings**).
    - **New strings** are strings that will be added to the .po file and will need to be translated.
    - **Obsolete strings** are strings that aren't used any more and will be removed from the to the .po file.

#### Adding languages to Poedit's spell checker

Extracted from [Poedit's documentation](https://poedit.net/trac/wiki/Doc/SpellcheckerLinux):

> #### Adding languages to spellchecker on Linux
> Poedit uses system spellchecker. To add support for catalog's language, you need to install appropriate dictionary package. The details of this are distribution specific; typically, the package would be called myspell-<language code>, aspell-<language code> or similarly.
> 
> TODO: add instructions for popular distributions

I tried the three types of dictionaries that I could find on Linux Mint's repositories. Use the one that you prefer.

- myspell-<language code>: It wasn't recognised by Poedit in my system.
- aspell-<language code>: It was recognised by Poedit.
- hunspell-<language code>: It was recognised by Poedit.

