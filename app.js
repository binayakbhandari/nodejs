require('dotenv').config()
const express = require('express')
const connectToDatabase = require('./database')
const Blog = require('./model/blogModel')
const app = express()
app.use(express.json())



connectToDatabase()

 // API to create blog
app.post("/blog", async (req, res)=>{
    const {title, subtitle, description} = req.body
    await Blog.create({
        title : title,
        subtitle : subtitle,
        description : description
    })
    res.status(200).json({
        message : "Blog Created Successfully !",
    })
})

// API to fetch blogs
app.get("/blog", async (req, res)=>{
    const blogs = await Blog.find()
    if(blogs.length === 0){
        return res.status(404).json({
            message: "No data found"
        })
    }
    res.status(200).json({
        message : "Blogs fetched sucessfully !",
        data : blogs
    })
})

// API to fetch single blog
app.get("/blog/:id", async (req, res)=>{
    const {id} = req.params
    const blog = await Blog.findById(id)
    if(!blog){
        return res.status(404).json({
            message: "No data found"
        })
    }
    res.status(200).json({
        message : "Blog fetched successfully !",
        data : blog
    })
})

// API to delete blog
app.delete("/blog/:id", async (req, res)=>{
    const {id} = req.params
    const blog = await Blog.findById(id)
    if(!blog){
        return res.status(404).json({
            message: "No data found"
        })
    }
    await Blog.findByIdAndDelete(id)
    res.status(200).json({
        message : "Blog deleted successfully !"
    })
})

// API to edit blog
app.put("/blog/:id", async (req, res)=>{
    const {id} = req.params
    const blog = await Blog.findById(id)
    if(!blog){
        return res.status(404).json({
            message: "No data found"
        })
    }
    const {title, subtitle, description} = req.body
    await Blog.findByIdAndUpdate(id, {
        title : title,
        subtitle : subtitle,
        description : description
    })
    res.status(200).json({
        message : "Blog updated successfully !"
    })
})


app.listen(process.env.PORT, ()=>{
    console.log("NodeJS Project Started")
})