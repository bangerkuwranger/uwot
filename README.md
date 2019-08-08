# Useless Waste of Time

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fbd2b2d2f91d42c18af03592a6cb704b)](https://app.codacy.com/app/bangerkuwranger/uwot?utm_source=github.com&utm_medium=referral&utm_content=bangerkuwranger/uwot&utm_campaign=Badge_Grade_Dashboard)[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/ddb5a7c96cc64fe59bcf82ac7c8c22d0)](https://www.codacy.com/app/bangerkuwranger/uwot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bangerkuwranger/uwot&amp;utm_campaign=Badge_Coverage)

Another unsupported, half-finished experiment made in a non-existent kind of time (free?).

## What does it do?

It creates a web interface that simulates the experience of a bash(ish) shell, which can be used for any number of applications, depending on configuration. When complete, at a minimum, it will allow an admin to set up an application that allows users to browse content in a public directory within a virtual file system. Future plans include reverse proxy support for additional content, 'console' or 'x-window' mode for graphical content, support for generating custom themes or 'bins', and some other miscellania.

## Why?

It seemed like a fun thing to make. There are a lot of awesome NPM packages that create local CLIs, or actually allow server access via bash replacement, or any number of actually useful things that, although similar, are not the same. This project was designed to create an end-user interface, that, while similar to any number of CLI interfaces and shells for any number of actually useful software, would essentially be window dressing for standard web content. It gave me an opportunity to improve my Node.js, automated testing, and CI/DI practices while I was at it... plus it is something I planned to use for the next iteration of my personal site, which has typically provided an atypical user experience anyhow.

## Why Should I Care?

No one is asking you to, imaginary conversation partner. Admittedly, there doesn't seem to be much practical application of this package outside of making conspicuously nerd-baiting websites, and most likely rather insecure ones at that, but that's part of the fun. For me, anyhow. I can't speak (much more) for imaginary socratic constructs.

## Seriously, are you going to provide an real documentation?

Sure, at some point, that is the plan. I'd like to get it, y'know, functional, before I write anything about actually using it.

## So, it doesn't work?

Well, as of alpha 21, it has a functioning shell interface that allows an admin to configure it, can run in prod, dev, debug, test, etc., and will indeed create a functional CLI interface that provides a somewhat limited instruction set. Commands like history, clear, login/logout, and most of the standard bash builtins are already implemented, and they do function as expected... which is nice. It's mostly running stable at this point, and handles virtual filesystem operations, parallel commands, etc. much better. Redirects to/from files in VFS are now working, and it's on the verge of allowing cli-driven browsing of local and remote web content. :-D Modularization and discrete user environments are getting better now, with most scaffolding for listeners, instanceSessions, sessions, filesystems, permissions, and local VFS in place and stable. Oh! CSS compilation doesn't rely on having ruby locally on the server anymore, either... since it's... well... at least five years past Compass time. Everything API wise is still very much in flux, but we gotta nail down the basics before the fun stuff.

## What, oh heavens, is missing?

You're not regretting reading this far down, are you? What if I have coupons for free tacos or something in here? Anyhow... support for some common CLI stuff like pipelines, functions, root user, conditionals... yknow... stuff you use regularly, are on the way. Eventually, the ability to generate a new node project from the shell that can support additional themes, commands, and configs will be there too, along with logic and docs to support those things. The ability to use this as a web interface for content, a local text editor, some enduser community stuff, AI autocomplete, support for actual DBs... these are all _planned_, and in some cases __the entire point__, but we'll see just how much nonexistent time can be forced into existence by pure will. (or cash. cash works too.)

## Let's say, __hypothetically__, I wanted to use this..?

Right now, it works IN PLACE without installing via NPM. Toss it on a node-ready server from the zip file and mess around with the shell:

`node shell/shell.js`

You'll want to init the DB (file based, so don't multi-instance yet, killer), set up users and config files, and probably compile the css. Run from `bin/www`, or using the npm scripts. I think I threw nodemon in there, if you're not on windows. 

As previously mentioned... somewhere... plan for actual NPM install is to allow integration into an existing project, OR to just make it generate its own projects, much like expressjs does for its projects. (or... both?) For now though, it is quite messaroundable, but not truly deployable imho.

## bash? Really??

Be thankful it's not just sh. Or Bell's sh. Or DOS. Y'all want DOS?

Seriously, it's a hybrid of a few different shell ideas, but is most similar to bash 'cuz most anyone who would have any interest in this at all has likely used bash at some point.

## About those free tacos...

That is not a question.
