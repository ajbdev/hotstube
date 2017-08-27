const glob = require('glob')
const path = require('path')
const fs = require('fs')

class HighlightDir {
    constructor(dir) {
        this.dir = dir
        this.files = null
    }

    allFiles(cb) {       
        if (this.files === null) {
            this.files = glob.sync(path.join(this.dir,"**/*.webm"))    
        }
        return this.files        
    }

    deleteEmptyDirectories(dir) {
        if (!fs.statSync(dir).isDirectory()) {
            return
        }

        let files = fs.readdirSync(dir)

        files.map((file) => {
            let fullPath = path.join(dir, file)
            this.deleteEmptyDirectories(fullPath)
        })

        files = fs.readdirSync(dir)
        

        if (files.length == 0) {
            console.log("Deleting folder ", dir);
            fs.rmdirSync(dir);
            return;
        }
    }

    size(files = null) {

        if (!files) {
            files = this.allFiles()
        }

        let size = 0
        files.map((file) => {
            size += fs.statSync(file).size
        })

        return size
    }

    prune(days) {
        this.findOlderThan(days).map((file) => {
            fs.unlinkSync(file, (err) => {
                if (err) {
                    console.log('Could not delete ' + file + ': ' + err)
                }
            })
        })
        this.deleteEmptyDirectories(this.dir)
    }

    findOlderThan(days) {
        let timeAgo = new Date()
        timeAgo.setDate(timeAgo.getDate() - 7)

        return this.allFiles().filter((file) => {
            let fileDate = fs.statSync(file).ctime

            return fileDate > timeAgo
        })
    }
}

module.exports = HighlightDir