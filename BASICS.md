# Various How-tos about basic tasks

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

#### 4. Add remote url to your local git repo

```shell
git remote set-url origin git+ssh://git@github.com/user_name/repo_name.git
```
