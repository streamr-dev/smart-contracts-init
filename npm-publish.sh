#!/bin/bash -eux

cd npm-package
npm version patch
npm publish
