const Blog = require("../models/blog");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/multerConfig");

// Fungsi untuk mendapatkan daftar gambar dari konten blog
const getImagesFromContent = (content) => {
  const $ = cheerio.load(content);
  const images = [];

  $('img[src^="/images/"]').each((index, element) => {
    const imageSrc = $(element).attr("src");
    images.push(imageSrc);
  });

  return images;
};
// Fungsi untuk mendapatkan daftar gambar dari konten blog
const getImagesFromUpdatedContent = (content) => {
  const $ = cheerio.load(content);
  const images = [];

  $('img[src^="http://localhost:5000/images/"]').each((index, element) => {
    const imageSrc = $(element).attr("src");
    images.push(imageSrc);
  });

  return images;
};

// Fungsi untuk menghapus gambar dari server
const deleteImages = (images) => {
  images.forEach((image) => {
    const imagePath = path.join(__dirname, "..", "public", image);
    if (fs.existsSync(imagePath)) {
      // Hapus gambar hanya jika file gambar masih ada
      fs.unlinkSync(imagePath);
    }
  });
};

const checkAndDeleteMissingImages = (originalContent, updatedContent) => {
  const $ = cheerio.load(updatedContent);
  const originalImages = getImagesFromContent(originalContent);
  const updatedImages = getImagesFromUpdatedContent(updatedContent).map((image) =>
    image.replace("http://localhost:5000", "")
  );

  const missingImages = [];

  originalImages.forEach((image) => {
    if (!updatedImages.includes(image)) {
      // The image is missing in the updated content
      missingImages.push(image);
    }
  });

  // Delete the missing images
  missingImages.forEach((image) => {
    const imagePath = path.join(__dirname, "..", "public", image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
};

let imageCounter = 0;

const getNextImageCounter = () => {
  return ++imageCounter;
};

module.exports = {
  getAllBlog: async (req, res) => {
    let { title = false } = req.query;
    try {
      let query = {};
      if (title) {
        query.title = { $regex: title, $options: "i" };
      }

      // execute query with page, limit, and filter values
      let blog = await Blog.find(query, "-__v")
        .populate("createdBy", "-__v -password -profile -gender -is_verified -birth_date -date_birth -role -email")
        .exec();

      res.status(200).json(blog);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
      });
    }
  },
  getLatestBlogs: async (req, res) => {
    try {
      // Retrieve the latest 3 data
      const blogs = await Blog.find({}, "-__v")
        .sort({ createdAt: -1 }) // Sort in descending order based on createdAt field
        .limit(3)
        .populate("createdBy", "-__v -password -profile -gender -is_verified -birth_date -date_birth -role -email")
        .exec();
  
      res.status(200).json(blogs);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
      });
    }
  },
  
  getBlogById: async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate("createdBy", "-__v -email -password -role -_id -profile");
    try {
      res.status(200).json({
        message: "success",
        data: blog,
      });
    } catch (error) {
      res.status(404).json({
        message: "error",
      });
    }
  },

  createBlog: async (req, res) => {
    upload.single("thumbnail")(req, res, async function (err) {
      const { title, description, author, content } = req.body;
      const createdBy = req.user._id;
      if (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
      }

      // Get the thumbnail image file
      const thumbnailFile = req.file;

      // Validasi jumlah kata dalam deskripsi
      const wordCount = description.trim().split(" ").length;
      if (wordCount > 50) {
        // Delete the uploaded thumbnail image if the description exceeds the word limit
        if (thumbnailFile) {
          fs.unlinkSync(thumbnailFile.path);
        }
        return res.status(400).json({ message: "Deskripsi melebihi batas maksimum kata." });
      }

      // Mengubah tag <img> dengan atribut src Base64 menjadi tautan gambar yang valid
      const $ = cheerio.load(content);
      $("img").each((index, element) => {
        const base64Data = $(element).attr("src").split(";base64,").pop();
        const imageExtension = $(element).attr("src").split("/")[1].split(";")[0];
        const imageFileName = `image_${Date.now()}_${getNextImageCounter()}.${imageExtension}`;
        const imagePath = path.join(__dirname, "..", "public", "images", imageFileName);

        // Create the "images" folder if it doesn't exist
        const imagesFolderPath = path.join(__dirname, "..", "public", "images");
        if (!fs.existsSync(imagesFolderPath)) {
          fs.mkdirSync(imagesFolderPath);
        }

        // Menyimpan gambar ke server
        fs.writeFileSync(imagePath, base64Data, { encoding: "base64" });

        // Mengubah atribut src menjadi tautan gambar yang valid
        $(element).attr("src", `/images/${imageFileName}`);
      });

      // Set the thumbnail image path in the blog data
      let thumbnailImagePath = "";
      if (thumbnailFile) {
        thumbnailImagePath = `/thumbnails/${thumbnailFile.filename}`;
      }

      const newBlog = new Blog({
        title,
        description,
        author,
        content: $.html(),
        thumbnail: thumbnailImagePath,
        createdBy,
      });

      try {
        const savedBlog = await newBlog.save();
        res.status(200).json(savedBlog);
      } catch (error) {
        // Delete the uploaded thumbnail image if there is an error
        if (thumbnailFile) {
          fs.unlinkSync(thumbnailFile.path);
        }
        res.status(404).json({
          message: "Error",
          error: error.message,
        });
      }
    });
  },

  updateBlog: async (req, res) => {
    upload.single("thumbnail")(req, res, async function (err) {
      const { title, description, author, content } = req.body;
      const blogId = req.params.id;
      const updatedBy = req.user._id;

      let updatedBlog = {
        title,
        description,
        author,
        updatedBy,
      };

      if (description) {
        // Validasi jumlah kata dalam deskripsi
        const wordCount = description.trim().split(" ").length;
        if (wordCount > 50) {
          return res.status(400).json({ message: "Deskripsi melebihi batas maksimum kata." });
        }
      }

      if (content) {
        // Mengubah tag <img> dengan atribut src Base64 menjadi tautan gambar yang valid
        const $ = cheerio.load(content);

        $("img").each((index, element) => {
          const imageSrc = $(element).attr("src");

          // Periksa apakah gambar adalah gambar dengan format base64
          if (imageSrc.startsWith("data:image")) {
            const base64Data = imageSrc.split(";base64,").pop();
            const imageExtension = imageSrc.split("/")[1].split(";")[0];
            const imageFileName = `image_${Date.now()}_${getNextImageCounter()}.${imageExtension}`;
            const imagePath = path.join(__dirname, "..", "public", "images", imageFileName);

            // Menyimpan gambar ke server
            fs.writeFileSync(imagePath, base64Data, { encoding: "base64" });

            // Mengubah atribut src menjadi tautan gambar yang valid
            $(element).attr("src", `/images/${imageFileName}`);
          }
        });
        updatedBlog.content = $.html();
      }

      // Get the thumbnail image file
      const thumbnailFile = req.file;

      // Set the thumbnail image path in the blog data
      let thumbnailImagePath = "";
      if (thumbnailFile) {
        thumbnailImagePath = `/thumbnails/${thumbnailFile.filename}`;
        updatedBlog.thumbnail = thumbnailImagePath;
      }

      try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
          return res.status(404).json({ message: "Blog not found." });
        }

        // Delete the existing thumbnail image if the new thumbnail is uploaded and the old thumbnail exists
        if (thumbnailFile && blog.thumbnail) {
          const thumbnailPath = path.join(__dirname, "..", "public", blog.thumbnail.replace("/", ""));

          // Check if the thumbnail file exists before trying to delete it
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          } else {
            console.log("Thumbnail file does not exist. Skipping deletion.");
          }
        }

        // Check and delete missing images
        const originalContent = blog.content;
        if (content) {
          checkAndDeleteMissingImages(originalContent, updatedBlog.content);
        }

        // Mengupdate blog dengan data yang baru
        await Blog.findByIdAndUpdate(blogId, updatedBlog);

        res.status(200).json({ message: "Blog updated successfully." });
      } catch (error) {
        console.log(error);
        if (thumbnailFile) {
          fs.unlinkSync(thumbnailFile.path);
        }
        res.status(500).json({ message: "Error updating blog.", error: error.message });
      }
    });
  },

  deleteBlog: async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    try {
      let blog;
      if (isAdmin) {
        // Jika pengguna adalah admin, cari blog berdasarkan ID saja
        blog = await Blog.findOne({ _id: id });
      } else {
        // Jika pengguna bukan admin, cari blog berdasarkan ID dan pastikan pengguna adalah pembuat blog
        blog = await Blog.findOne({ _id: id, createdBy: userId });
      }
      if (!blog) {
        return res.status(404).json({ message: "Blog tidak ditemukan." });
      }

      // Hapus gambar thumbnail yang terkait dengan blog
      const thumbnailImage = blog.thumbnail;
      if (thumbnailImage) {
        const thumbnailPath = path.join(__dirname, "..", "public", thumbnailImage);
        fs.unlinkSync(thumbnailPath);
      }

      // Hapus gambar yang terkait dengan blog jika ada
      const images = getImagesFromContent(blog.content);
      deleteImages(images);

      // Hapus blog dari database
      await Blog.deleteOne({ _id: id });

      res.status(200).json({ message: "Blog berhasil dihapus." });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat menghapus blog.",
        error: error.message,
      });
    }
  },
};
