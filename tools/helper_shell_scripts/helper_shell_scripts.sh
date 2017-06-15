#!/bin/bash

ROOT_PATH="`pwd`"                 # relative
main_site_pug_files=("index.pug" "wiki.pug" "wiki_standalone.pug")
xlets_types=("applets" "extensions" "themes" "tools")
# Only package tools in this list.
tools_whitelist=("make-xlet-pot" "dead-to-bash")

echoInfo() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 77)$1$(tput sgr0)" >&2
}

echoWarn() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 220)$1$(tput sgr0)" >&2
}

echoError() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 166)$1$(tput sgr0)" >&2
}

renderMainSite() {
    # This requires to have the repository wiki cloned into a folder inside the docs folder.
    cd "docs/src"
    ./build_pages.py
}


# Tried to convert this function to Python. Didn't work out that well.
# Next time, I try with threading or multiprocess.
# For the moment, that's way out of my league.
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

# StackOverflow to the rescue!!! http://stackoverflow.com/a/35832513/4147432
# The only answer that worked for me of the dozens that can be found there.
arrayContains() {
    local haystack=${!1}
    local needle="$2"
    printf "%s\n" ${haystack[@]} | grep -q "^$needle$"
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

# Seeing all the problems that coused me trying to convert the generateTransStats function
# to Pythom, I didn't even bother to try this function. So, same as with generateTransStats
# function, I will try to convert the createPackages function in the future.
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
            echo " " >&2
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

                        echo " " >&2

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
                            rm -f $ROOT_PATH/docs/pkg/$xlet.tar.gz >&2

                            echoInfo "====== Packaging $xlet ======"
                            tar -cvzf "$ROOT_PATH/docs/pkg/$xlet.tar.gz" $xlet >&2
                        fi
                    )
                fi
            done
        )

        sleep 0.5
    done

    # The tools structure is totally different from the xlets, so package them separately.
    echo " " >&2
    echoWarn "Packaging tools..."
    cd tools
    for tool in *; do
        if [ -d ${tool} ]; then
            # Only package standalone tools.
            if arrayContains tools_whitelist[@] $tool; then
                if [ ! -f $ROOT_PATH/tmp/shasums/$tool ]; then
                    current_sha=""
                else
                    current_sha=$(<$ROOT_PATH/tmp/shasums/$tool)
                fi

                new_sha=""
                get_sha512sum "$ROOT_PATH/tools/$tool" new_sha

                echo " " >&2
                sleep 0.2

                if [ "$new_sha" == "$current_sha" ]; then
                    echoInfo "====== Skipping packaging of $tool ======"
                else
                    echoInfo "====== Storing shasum for $tool ======"
                    echo -n $new_sha > $ROOT_PATH/tmp/shasums/$tool

                    echoInfo "====== Deleting old $tool package ======"
                    rm -f $ROOT_PATH/docs/pkg/$tool.tar.gz >&2

                    echoInfo "====== Packaging $tool ======"
                    tar -cvzf "$ROOT_PATH/docs/pkg/$tool.tar.gz" $tool >&2
                fi
            fi
        fi

        sleep 0.5
    done
}

arg=$1

if [ "$arg" == "render-main-site" ]; then
    renderMainSite
elif [ "$arg" == "generate-trans-stats" ]; then
    generateTransStats "applets" "extensions"
elif [ "$arg" == "create-packages" ]; then
    createPackages
fi
