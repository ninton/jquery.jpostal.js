#!/bin/bash

failed=`grep "<failure" $1 | wc -l`
exit $failed
