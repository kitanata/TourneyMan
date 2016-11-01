gulp clean
gulp build
gulp copy_package_files
pushd build
npm install
./node_modules/.bin/build
popd
mkdir dist
cp build/dist/mac/*.tar.gz dist/.
cp build/dist/mac/*.zip dist/.
cp build/dist/mac/*.dmg dist/.
