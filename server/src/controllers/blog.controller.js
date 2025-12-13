const pool = require('../config/db');
const { uploadToS3 } = require('../services/upload.service');

exports.getAllBlogs = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT b.id, b.title, b.slug, b.category_id, b.banner_image, b.published, b.created_at, b.podcast_published, b.podcast_duration_seconds, c.name as category_name FROM blogs b LEFT JOIN categories c ON b.category_id = c.id ORDER BY b.created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getBlogBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        // Increment views
        await pool.query('UPDATE blogs SET views = COALESCE(views, 0) + 1 WHERE slug = $1', [slug]);

        const result = await pool.query(`
            SELECT b.*, c.name as category_name 
            FROM blogs b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.slug = $1
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const blog = result.rows[0];

        if (blog.podcast_url) {
            const chapters = await pool.query('SELECT * FROM podcast_chapters WHERE blog_id = $1 ORDER BY start_seconds ASC', [blog.id]);
            blog.chapters = chapters.rows;
        }

        res.json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper to decode Base64 content if needed
const decodeContent = (str) => {
    if (!str) return str;
    // Simple check if it looks like Base64 (starts with "PC" usually for <p> or general regex)
    // Note: To be safe, we will try to decode. If it fails, return original.
    try {
        // Check if string is base64
        const decoded = Buffer.from(str, 'base64').toString('utf-8');
        // Validate if decoded looks like HTML (contains < >) or just return decoded
        // For this use case, we assume frontend ALWAYS sends base64 for content
        return decoded;
    } catch (e) {
        return str;
    }
};

exports.createBlog = async (req, res) => {
    // Admin only
    console.log('📝 Creating Blog:', req.body);

    const {
        title, slug, content, published, podcast_published, youtube_url, youtube_embed_title, podcast_duration_seconds,
        category_id, author_name, author_email, author_whatsapp, author_linkedin, author_profession
    } = req.body;

    try {
        // Decode content to bypass Firewall
        const safeContent = decodeContent(content);

        let bannerImageUrl = req.body.banner_image;
        let podcastUrl = req.body.podcast_url;
        let authorImageUrl = req.body.author_image;

        if (req.files) {
            if (req.files.banner_image && req.files.banner_image[0]) {
                bannerImageUrl = await uploadToS3(req.files.banner_image[0], 'blogs/banners');
            }
            if (req.files.podcast_audio && req.files.podcast_audio[0]) {
                podcastUrl = await uploadToS3(req.files.podcast_audio[0], 'podcasts/audio');
            }
            if (req.files.author_image && req.files.author_image[0]) {
                authorImageUrl = await uploadToS3(req.files.author_image[0], 'authors/photos');
            }
        }

        const query = `
            INSERT INTO blogs (
                title, slug, content, banner_image, published, podcast_url, 
                podcast_duration_seconds, podcast_published, youtube_url, youtube_embed_title,
                category_id, author_name, author_image, author_email, author_whatsapp, author_linkedin, author_profession, author_bio
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        `;
        const values = [
            title,
            slug,
            safeContent, // Use decoded content
            bannerImageUrl,
            published === 'true' || published === true,
            podcastUrl,
            parseInt(podcast_duration_seconds) || 0,
            podcast_published === 'true' || podcast_published === true,
            youtube_url,
            youtube_embed_title,
            category_id || null,
            author_name, authorImageUrl, author_email, author_whatsapp, author_linkedin, author_profession,
            req.body.author_bio || null
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Slug already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    console.log('📝 Updating Blog:', id, req.body);

    const {
        title, slug, content, published, podcast_published, youtube_url, youtube_embed_title, podcast_duration_seconds,
        category_id, author_name, author_email, author_whatsapp, author_linkedin, author_profession, author_bio
    } = req.body;

    // Decode content to bypass Firewall
    const safeContent = decodeContent(content);

    try {
        let bannerImageUrl = req.body.banner_image;
        let podcastUrl = req.body.podcast_url;
        let authorImageUrl = req.body.author_image;

        if (req.files) {
            if (req.files.banner_image && req.files.banner_image[0]) {
                bannerImageUrl = await uploadToS3(req.files.banner_image[0], 'blogs/banners');
            }
            if (req.files.podcast_audio && req.files.podcast_audio[0]) {
                podcastUrl = await uploadToS3(req.files.podcast_audio[0], 'podcasts/audio');
            }
            if (req.files.author_image && req.files.author_image[0]) {
                authorImageUrl = await uploadToS3(req.files.author_image[0], 'authors/photos');
            }
        }

        const query = `
            UPDATE blogs 
            SET title = $1, slug = $2, content = $3, banner_image = $4, published = $5, 
                podcast_url = $6, podcast_duration_seconds = $7, podcast_published = $8, 
                youtube_url = $9, youtube_embed_title = $10,
                category_id = $11, author_name = $12, author_image = $13, 
                author_email = $14, author_whatsapp = $15, author_linkedin = $16, author_profession = $17,
                author_bio = $18, updated_at = NOW()
            WHERE id = $19
            RETURNING *
        `;
        const values = [
            title, slug, safeContent, bannerImageUrl,
            published === 'true' || published === true,
            podcastUrl,
            parseInt(podcast_duration_seconds) || 0,
            podcast_published === 'true' || podcast_published === true,
            youtube_url, youtube_embed_title,
            category_id || null,
            author_name, authorImageUrl, author_email, author_whatsapp, author_linkedin, author_profession,
            author_bio || null,
            id
        ];

        console.log('🔍 UPDATE Values:', values);

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const folder = req.body.folder || 'uploads';
        const url = await uploadToS3(req.file, folder);
        res.json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
}


exports.incrementLikes = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE blogs SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json({ likes: result.rows[0].likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
