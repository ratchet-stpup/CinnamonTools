#!/bin/bash


# rm /path/to/directory/*
ROOT_PATH="`dirname \"$0\"`"                 # relative
ROOT_PATH="`( cd \"$ROOT_PATH\" && pwd )`"   # absolutized and normalized

PKGS_PATH=$ROOT_PATH/gh-pages/pkg

# Cleanup folder
rm -f $PKGS_PATH/*

sleep 5

all_applets=("0dyseus@CustomCinnamonMenu" "0dyseus@DesktopHandler" "0dyseus@ExtensionsManager" "0dyseus@PopupTranslator" "0dyseus@QuickMenu" "0dyseus@SysmonitorByOrcus" "0dyseus@window-list-fork")
all_extensions=("0dyseus@CinnamonMaximusFork" "0dyseus@CinnamonTweaks" "0dyseus@WindowDemandsAttentionBehavior")
all_themes=("Mint-XY" "Mint-XY-Greybird-Blue")

echoInfo() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 10)$1$(tput sgr0)" >&2
}


for applet in "${all_applets[@]}" ; do
    echoInfo "====== Packaging $applet ======"
    cd "$ROOT_PATH/Applets/$applet/files"
    tar -cvzf "$PKGS_PATH/$applet.tar.gz" $applet
done

sleep 5

for extension in "${all_extensions[@]}" ; do
    echoInfo "====== Packaging $extension ======"
    cd "$ROOT_PATH/Extensions/$extension/files"
    tar -cvzf "$PKGS_PATH/$extension.tar.gz" $extension
done

sleep 5

for theme in "${all_themes[@]}" ; do
    echoInfo "====== Packaging $theme ======"
    cd "$ROOT_PATH/Themes/$theme/files"
    tar -cvzf "$PKGS_PATH/$theme.tar.gz" $theme
done
