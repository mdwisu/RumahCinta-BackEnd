const { response } = require("express");
const Video = require("../models/video");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const YouTubeVideoId = require("youtube-video-id").default;
const youtubeUrl = require("youtube-url");

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
  getAllVideo: async (req, res) => {
    let { title = false, page = 1, limit } = req.query;

    try {
      let query = {};
      if (title) {
        query.title = { $regex: ".*" + title + ".*", $options: "i" };
      }

      let count = await Video.countDocuments(query);

      // if limit not set
      if (!limit) {
        limit = count;
      }

      // if page gt page count
      const pageCount = Math.ceil(count / limit);
      if (page > pageCount) {
        page = pageCount;
      }

      let video = await Video.find(query, "-__v")
        .populate("createdBy", "-_id -email -password -role -isVerified -__v")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      res.json({
        video,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getLatestVideo: async (req, res) => {
    try {
      const latestVideos = await Video.find()
        .sort({ createdAt: -1 }) // Mengurutkan berdasarkan createdAt secara descending (terbaru ke terlama)
        .limit(4) // Membatasi jumlah hasil menjadi 4
        .populate("createdBy", "-_id -email -password -role -isVerified -__v")
        .select("-__v")
        .exec();

      res.json(latestVideos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getVideoById: async (req, res) => {
    try {
      const { id } = req.params;
      const video = await Video.findById(id);

      res.status(200).json({
        message: "Sukses mendapatkan data video",
        data: video,
      });
    } catch (error) {
      console.log(error);
    }
  },

  addVideo: (req, res) => {
    const { title, videoLink, description, author } = req.body;
    const userId = req.user._id;

    if (videoLink && !youtubeUrl.valid(videoLink)) {
      res.status(400).json({ message: "Invalid YouTube video link" });
      return;
    }

    const videoId = YouTubeVideoId(videoLink);

    const video = new Video({
      title,
      videoId,
      description,
      author,
      createdBy: userId,
    });

    video.save();

    res.status(200).json({
      message: "Video baru berhasil ditambahkan!",
    });
  },

  updateVideoById: async (req, res) => {
    const { title, videoLink, description, author } = req.body;
    const videoId = req.params.id;
    const updatedBy = req.user._id;
  
    // Buat objek updatedVideo tanpa videoId
    let updatedVideo = {
      title,
      description,
      author,
      updatedBy,
    };
  
    // Jika videoLink dikirim, tambahkan videoId ke updatedVideo
    if (videoLink) {
      const newVideoId = YouTubeVideoId(videoLink);
      updatedVideo.videoId = newVideoId;
    }
  
    try {
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found." });
      }
  
      await Video.findByIdAndUpdate(videoId, updatedVideo);
  
      res.status(200).json({ message: "Video updated successfully." });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating video.", error: error.message });
    }
  },

  deleteVideoById: async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);

    await video.remove();

    res.json({
      message: "Data yang dipilih berhasil dihapus!",
      data: "terhapus",
    });
  },

  addComment: async (req, res) => {
    const { id } = req.params;
    const { commentContent, postedBy } = req.body;

    if (!commentContent) {
      res.status(400).json({
        message: "Comment harus diisi",
      });
      return;
    }

    const video = await Video.findByIdAndUpdate(id, {
      $push: {
        comment: {
          commentContent,
          postedBy,
        },
      },
    });

    await video.save();

    res.status(200).json({
      message: "Data berhasil diupdate!",
    });

    video.save();
  },

  getAllCommentByVideo: async (req, res) => {
    try {
      const { id } = req.params;
      const video = await Video.findById(id, "-_id -link -judul -deskripsi -tanggalUpload").populate(
        "comment.postedBy",
        "-_id -email -password -role -profile_url -__v"
      );

      res.status(200).json({
        message: "Sukses mendapatkan data video",
        data: video,
      });
    } catch (error) {
      console.log(error);
    }
  },

  deleteComment: async (req, res) => {
    const { id } = req.params;
    // const { commentContent, postedBy } = req.body;

    const video = await Video.findByIdAndUpdate(id, {
      $pull: {
        comment: { _id: req.params.commentID },
      },
    });

    await video.save();

    res.status(200).json({
      message: "Data berhasil diupdate!",
    });
  },
};
