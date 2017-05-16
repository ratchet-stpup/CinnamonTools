#!/bin/bash

# Render main site
# This option renders the main site (creates the HTML files from PUG sources).
# The main site is just the GitHub page associated with the repository.
# https://odyseus.github.io/CinnamonTools

# Create help files
# This option creates all the help files from all the xlets on the repository
# The scripts called create_localized_help.py are the ones that creates
# the HTML files and from which the make-xlet-pot command extracts the strings
# that will be used to create the localized sections of the help file.

# Create packages
# This option packages all the xlets found in the repository and saves them
# into /docs/pkg folder.
# The shasum of each xlet folder is stored into /tmp/shasums for later use.
# The next time that the "Create packages" option is run, it will only package
# the xlets whose folder contents has been changed.

# Clone wiki
# This option clones the repository's wiki into the /docs folder.
# The wiki's files are used to create part of the main site.

# Xlets comparison
# Compare installed xlets with the ones found on the repository using meld.

# Set/Check files permission
# Set and/or check the execution permission for all files that need to be.
# As of now, only .sh and .py files are set to be executable.

# Update .pot files
# Update all localization templates of all xlets. This will also update all .po
# files from the newly updated ,pot file and store the amount of untranslated
# strings for later use.

prompt="$(tput bold)$(tput bold)Pick an option and press Enter:$(tput sgr0)"

ROOT_PATH="`dirname \"$0\"`"                 # relative
ROOT_PATH="`( cd \"$ROOT_PATH\" && pwd )`"   # absolutized and normalized
XLETS_PATH="$HOME/.local/share/cinnamon"

all_pug_files=("index.pug" "wiki.pug" "wiki_standalone.pug")
xlets_types=("applets" "extensions" "themes" "tools")

echoInfo() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 10)$1$(tput sgr0)" >&2
}

echoWarn() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 11)$1$(tput sgr0)" >&2
}

echoError() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 9)$1$(tput sgr0)" >&2
}

renderMainSite() {
    # This requires to have the repository wiki cloned into a folder inside the docs folder.
    for pug_file in "${all_pug_files[@]}" ; do
        echo " "
        echoInfo "====== Rendering $pug_file ======"
        # Using a sub-shell to switch directories to avoid "back and forth".
        (
            cd "docs/src"
            pug $pug_file -o ../
        )
    done
}

createHelpFiles() {
    for type in ${xlets_types[@]}; do
        if [ "$type" == "themes" -o "$type" == "tools" ]; then
            continue
        fi

        (
            cd $type
            for xlet in *; do
                if [ -d ${xlet} ]; then
                    (
                        cd "$xlet"
                        if [ -f create_localized_help.py -a -x create_localized_help.py ]; then
                            echo " "
                            echoInfo "====== Creating help file for $xlet... ======"
                            ./create_localized_help.py -p && echo "Help file created"
                        fi
                    )
                fi

            sleep 0.5
            done
        )

        sleep 0.5
    done
}

get_sha512sum() {
    # https://unix.stackexchange.com/a/158766
    # This was the only method that I found that gives me really different shasums.
    # With other methods, if I only change the name of a single file, would give
    # the exact same shasum.
    dir="$(tr '\\' / <<< "$1" | tr -s / | sed 's-/$--')"
    cutted=$((${#dir} + 35))
    sha=$(find "$dir" -type f -exec sha512sum {} \; | cut -c 1-33,$cutted- | sort | sha512sum | cut -c 1-32)
    eval "$2='$sha'"
}

createPackages() {
    # Create the tmp dir if it doesn't exists.
    # The shasums are used to avoid the re-packaging of xlets that weren't modified.
    if [ ! -d $ROOT_PATH/tmp/shasums ]; then
      mkdir -p $ROOT_PATH/tmp/shasums;
    fi

    for type in ${xlets_types[@]}; do
        if [ "$type" == "tools" ]; then
            continue
        fi

        # Using a sub-shell to switch directories to avoid "back and forth".
        (
            echo " "
            echoWarn "Packaging $type..."
            cd $type
            for xlet in *; do
                if [ -d ${xlet} ]; then
                    # Get the previously calculated shasum if any.
                    # Store it earlier just in case.
                    if [ ! -f $ROOT_PATH/tmp/shasums/$xlet ]; then
                        current_applet_sha=""
                    else
                        current_applet_sha=$(<$ROOT_PATH/tmp/shasums/$xlet)
                    fi

                    (
                        cd "$xlet/files"
                        new_sha=""
                        get_sha512sum "$ROOT_PATH/$type/$xlet/files/$xlet" new_sha

                        echo " "
                        sleep 0.2

                        if [ "$new_sha" == "$current_applet_sha" ]; then
                            # If the stored and the calculated shasums are equal:
                            # Do nothing and do not touch the stored shasum.
                            echoInfo "====== Skipping packaging of $xlet ======"
                        else
                            # If the stored and the calculated shasums are NOT equal:
                            # 1- Store the new calculated shasum.
                            # 2- Delete old package.
                            # 3- Create new package.
                            echoInfo "====== Storing shasum for $xlet ======"
                            # Store the shasum WITHOUT the freaking new line (-n argument).
                            echo -n $new_sha > $ROOT_PATH/tmp/shasums/$xlet

                            echoInfo "====== Deleting old $xlet package ======"
                            rm -f $ROOT_PATH/docs/pkg/$xlet.tar.gz

                            echoInfo "====== Packaging $xlet ======"
                            tar -cvzf "$ROOT_PATH/docs/pkg/$xlet.tar.gz" $xlet
                        fi
                    )
                fi
            done
        )

        sleep 0.5
    done

    sleep 1

    # The tools structure is totally different from the xlets,
    # so package them separately.
    (
        echo " "
        echoWarn "Packaging tools..."
        cd tools
        for tool in *; do
            if [ -d ${tool} ]; then
                if [ ! -f $ROOT_PATH/tmp/shasums/$tool ]; then
                    current_sha=""
                else
                    current_sha=$(<$ROOT_PATH/tmp/shasums/$tool)
                fi

                new_sha=""
                get_sha512sum "$ROOT_PATH/tools/$tool" new_sha

                echo " "
                sleep 0.2

                if [ "$new_sha" == "$current_sha" ]; then
                    echoInfo "====== Skipping packaging of $tool ======"
                else
                    echoInfo "====== Storing shasum for $tool ======"
                    echo -n $new_sha > $ROOT_PATH/tmp/shasums/$tool

                    echoInfo "====== Deleting old $tool package ======"
                    rm -f $ROOT_PATH/docs/pkg/$tool.tar.gz

                    echoInfo "====== Packaging $tool ======"
                    tar -cvzf "$ROOT_PATH/docs/pkg/$tool.tar.gz" $tool
                fi
            fi
        done
    )
}

cloneWiki() {
    # Using a sub-shell to switch directories to avoid "back and forth".
    # Cloning into docs folder to keep main repo folder "uncluttered".
    (
        cd docs
        git clone https://github.com/Odyseus/CinnamonTools.wiki.git
    )
}

compareApplets() {
    (
        cd applets
        for applet in *; do
            if [ -d ${applet} ]; then
                meld "$XLETS_PATH/applets/$applet" \
                "$ROOT_PATH/applets/$applet/files/$applet" > /dev/null 2>&1 &
                sleep 0.5
            fi
        done
    )
}

compareExtensions() {
    (
        cd extensions
        for extension in *; do
            if [ -d ${extension} ]; then
                meld "$XLETS_PATH/extensions/$extension" \
                "$ROOT_PATH/extensions/$extension/files/$extension" > /dev/null 2>&1 &
                sleep 0.5
            fi
        done
    )
}

compareAll() {
    compareApplets
    sleep 2
    compareExtensions
}

compareXlets() {
    echo ""
    echo -e "$(tput bold)\
Compare installed xlets with the ones from the repository using meld\
    $(tput sgr0)"
    compare_options+=("Compare applets" "Compare extensions" "Compare all")
    select opt in "${compare_options[@]}" "Abort"; do
        case "$REPLY" in
            1 ) # Compare applets
                compareApplets
                ;;
            2 ) # Compare extensions
                compareExtensions
                ;;
            3 ) # Compare all
                compareAll
                break
                ;;
            $(( ${#compare_options[@]}+1 )) )
                echo "$(tput bold)$(tput setaf 11)Operation canceled.$(tput sgr0)"
                break
                ;;
            * )
                echo "$(tput bold)$(tput setaf 11)Invalid option. Try another one.$(tput sgr0)"
                ;;
        esac
    done
}

setCheckFilesPermission() {
    echo ""
    echo -e "$(tput bold)\
Check or set the execution permission for certain files (.sh and .py files)\
    $(tput sgr0)"
    permission_options+=("Check permission" "Set permission")
    select opt in "${permission_options[@]}" "Abort"; do
        case "$REPLY" in
            1 ) # Check permission
                applyFilesPermission "check"
                ;;
            2 ) # Set permission
                applyFilesPermission
                ;;
            $(( ${#permission_options[@]}+1 )) )
                echo "$(tput bold)$(tput setaf 11)Operation canceled.$(tput sgr0)"
                break
                ;;
            * )
                echo "$(tput bold)$(tput setaf 11)Invalid option. Try another one.$(tput sgr0)"
                ;;
        esac
    done
}

updatePOTFiles() {
    for type in "$@"; do
        # Using a sub-shell to switch directories to avoid "back and forth".
        (
            cd $type
            for xlet in *; do
                if [ -d $xlet/files/$xlet ]; then
                    echo " "
                    echoInfo "Updating $xlet's localization template..."
                    (
                        cd "$xlet/files/$xlet"
                        make-xlet-pot --all
                    )
                fi
            done
        )

        sleep 0.5
    done
}

handlePOTFiles() {
    echo ""
    echo -e "$(tput bold)\
Update .pot files from all xlets (make-xlet-pot is used if available)\
    $(tput sgr0)"
    if ! cmd_loc="$(type -p "make-xlet-pot")" || [ -z "$cmd_loc" ]; then
        echoError "make-xlet-pot command not found!!!"
    else
        pot_options+=("Update POT from all xlets" "Update POT from applets" "Update POT from extensions")
        select opt in "${pot_options[@]}" "Abort"; do
            case "$REPLY" in
                1 ) # Update POT from all xlets
                    updatePOTFiles "applets" "extensions"
                    ;;
                2 ) # Update POT from applets
                    updatePOTFiles "applets"
                    ;;
                3 ) # Update POT from extensions
                    updatePOTFiles "extensions"
                    ;;
                $(( ${#pot_options[@]}+1 )) )
                    echo "$(tput bold)$(tput setaf 11)Operation canceled.$(tput sgr0)"
                    break
                    ;;
                * )
                    echo "$(tput bold)$(tput setaf 11)Invalid option. Try another one.$(tput sgr0)"
                    ;;
            esac
        done
    fi
}

applyFilesPermission() {
    TEMP_FILE=$ROOT_PATH/tmp/files_to_set_permissions.txt
    # List all .sh and .py files ignoring symlinks and save them into a temp file.
    # First, override the file.
    find $ROOT_PATH -type f -iname "*.sh" > $TEMP_FILE
    # Then append to it.
    find $ROOT_PATH -type f -iname "*.py" >> $TEMP_FILE
    EXEC_FILES=`cat $TEMP_FILE`

    for file in $EXEC_FILES; do
        SHORTENED_PATH=${file#*$ROOT_PATH}
        if [ ! -x ${file} ]; then
            echoWarn "Not an executable: $SHORTENED_PATH"

            if [ "$1" != "check" ]; then
                echoWarn "Setting it as such..."
                chmod +x "$file"
                echo ""
            fi
        fi
    done
}

generateTransStats() {
    # Create the tmp dir to store the .po files lists if it doesn't exists.
    if [ ! -d $ROOT_PATH/tmp/po_files_list ]; then
      mkdir -p $ROOT_PATH/tmp/po_files_list;
    fi

    # Create the tmp dir to store the updated .po files if it doesn't exists.
    if [ ! -d $ROOT_PATH/tmp/po_files_updated ]; then
      mkdir -p $ROOT_PATH/tmp/po_files_updated;
    fi

    rm -f $ROOT_PATH/tmp/po_files_untranslated_count
    rm -f $ROOT_PATH/tmp/po_files_untranslated_table.md

    for type in "$@"; do
        # Using a sub-shell to switch directories to avoid "back and forth".
        (
            cd $type
            for xlet in *; do
                if [ -d "$xlet/files/$xlet/po" ]; then
                    echo " "
                    echoWarn "$xlet"
                    (
                        cd "$xlet/files/$xlet/po"
                        PO_LIST_TEMP_FILE=$ROOT_PATH/tmp/po_files_list/$xlet
                        UPDATED_PO_STORE=$ROOT_PATH/tmp/po_files_updated/$xlet
                        # Create the tmp dir to store the updated .po files if it doesn't exists.
                        if [ ! -d "$UPDATED_PO_STORE" ]; then
                          mkdir -p "$UPDATED_PO_STORE";
                        fi

                        find . -type f -iname "*.po" > $PO_LIST_TEMP_FILE
                        PO_FILES=`cat $PO_LIST_TEMP_FILE`
                        # Start the build of raw data
                        echo "" >> $ROOT_PATH/tmp/po_files_untranslated_count
                        echo "XLET LANGUAGE UNTRANSLATED" >> $ROOT_PATH/tmp/po_files_untranslated_count

                        # Start the build of a Markdown table
                        # Markdown heading
                        echo "### $xlet" \
                        >> $ROOT_PATH/tmp/po_files_untranslated_table.md
                        # Markdown table header
                        echo "|LANGUAGE|UNTRANSLATED|" \
                        >> $ROOT_PATH/tmp/po_files_untranslated_table.md
                        # Markdown table header separator
                        echo "|--------|------------|" \
                        >> $ROOT_PATH/tmp/po_files_untranslated_table.md

                        for file in $PO_FILES; do
                            SHORTENED_PATH=${file#*$ROOT_PATH}
                            PO_FILE=$(basename $file)
                            TMP_PO_PATH=$UPDATED_PO_STORE/$PO_FILE

                            if [ -f ${file} ]; then
                                echoInfo "Copying $PO_FILE to temporary location..."
                                /bin/cp -rf "$file" "$TMP_PO_PATH"
                                echoInfo "Updating temporary $PO_FILE from localization template..."
                                msgmerge -N --previous --backup=off --update "$TMP_PO_PATH" $xlet.pot \
                                &> /dev/null || echoError "Error updating $PO_FILE"

                                echoInfo "Counting and storing untranslated strings..."
                                UNTRANSLATED=`msggrep -v -T -e "." "$TMP_PO_PATH" | grep -c ^msgstr`

                                # Continue the build of raw data
                                echo "$xlet: $PO_FILE $UNTRANSLATED" >>\
                                $ROOT_PATH/tmp/po_files_untranslated_count

                                # Continue the build of a Markdown table
                                # Markdown table row
                                echo "|$PO_FILE|$UNTRANSLATED|" >>\
                                $ROOT_PATH/tmp/po_files_untranslated_table.md

                                echo ""
                            fi
                        done

                        echo "" >> $ROOT_PATH/tmp/po_files_untranslated_table.md
                    )
                fi
            done
        )

        sleep 0.5
    done

    sleep 1
    # Convert raw data into columns.
    # Leave Markdown data as is.
    column -t $ROOT_PATH/tmp/po_files_untranslated_count \
    > $ROOT_PATH/tmp/po_files_untranslated_count_column
}

main_done=0

while (( !main_done )); do
    main_options=("Render main site" "Create help files" "Create packages" \
"Clone wiki" "Xlets comparison" "Set/Check files permission" \
"Update .pot files" "Generate translations statistics")

    echo "$(tput bold)$(tput bold)Pick an option and press Enter:$(tput sgr0)"
    select opt in "${main_options[@]}" "Abort"; do
            case $REPLY in
            1 ) # Render main site pug files
                renderMainSite
                break
                ;;
            2 ) # Create help files
                createHelpFiles
                break
                ;;
            3 ) # Create packages
                createPackages
                break
                ;;
            4 ) # Clone wiki
                cloneWiki
                break
                ;;
            5 ) # Xlets comparison
                main_done=1
                compareXlets
                break
                ;;
            6 ) # Set/Check files permission
                main_done=1
                setCheckFilesPermission
                break
                ;;
            7 ) # Update .pot files
                main_done=1
                handlePOTFiles
                break
                ;;
            8 ) # Generate translations statistics
                main_done=1
                generateTransStats "applets" "extensions"
                break
                ;;
            $(( ${#main_options[@]}+1 )) ) # Abort
                main_done=1
                echo "$(tput bold)$(tput setaf 11)Operation canceled.$(tput sgr0)"
                break
                ;;
            * )
                echo "$(tput bold)$(tput setaf 11)Invalid option. Try another one.$(tput sgr0)"
                ;;
        esac
    done
done
