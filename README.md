# Useless Waste of Time

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fbd2b2d2f91d42c18af03592a6cb704b)](https://app.codacy.com/app/bangerkuwranger/uwot?utm_source=github.com&utm_medium=referral&utm_content=bangerkuwranger/uwot&utm_campaign=Badge_Grade_Dashboard)[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/ddb5a7c96cc64fe59bcf82ac7c8c22d0)](https://www.codacy.com/app/bangerkuwranger/uwot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bangerkuwranger/uwot&amp;utm_campaign=Badge_Coverage)

Another unsupported, half-finished experiment made in a non-existent kind of time (free?).

## What does it do?

It creates a web interface that simulates the experience of a bash shell, which can be used for any number of applications, depending on configuration. When complete, at a minimum, it will allow an admin to set up an application that allows users to browse content in a public directory within a virtual file system. Future plans include reverse proxy support for additional content, 'console' or 'x-window' mode for graphical content, support for generating custom themes or 'bins', and some other miscellania.

## Why?

It seemed like a fun thing to make. There are a lot of awesome NPM packages that create local CLIs, or actually allow server access via bash replacement, or any number of actually useful things that, although similar, are not the same. This project was designed to create an end-user interface, that, while similar to any number of CLI interfaces and shells for any number of actually useful software, would essentially be window dressing for standard web content. It gave me an opportunity to improve my Node.js, automated testing, and CI/DI practices while I was at it... plus it is something I planned to use for the next iteration of my personal site, which has typically provided an atypical user experience anyhow.

## Why Should I Care?

No one is asking you to, imaginary conversation partner. Admittedly, there doesn't seem to be much practical application of this package outside of making conspicuously nerd-baiting websites, and most likely rather insecure ones at that, but that's part of the fun. For me, anyhow. I can't speak (much more) for imaginary socratic constructs.

## Seriously, are you going to provide an real documentation?

Sure, at some point, that is the plan. I'd like to get it, y'know, functional, before I write anything about actually using it.

## So, it doesn't work?

Well, as of alpha 19, it has a functioning shell interface that allows an admin to configure it, can run in prod, dev, debug, test, etc., and will indeed create a functional CLI interface that provides a very limited instruction set. Commands like history, clear, login/logout, and some of the standard bash builtins are already implemented, and they do function as expected... which is nice. However, it's certainly not operating within the scope envisioned at this point... which is not so nice. It doesn't help that I got sidetracked by stabilizing what I'd already written by writing test scripts, automated quality checks, and so forth... but it'll get there. Eventually. The fact that I've even written this and made the repo public is a pretty good sign, right?
