// src/pages/NewPost.jsx

import React, { useState } from 'react';
import TiptapEditor from '../components/TiptapEditor';
import DashboardLayout from '../layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const NewPost = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const handleSavePost = async (status) => {
        setError(null);
        if (!title || !content) {
            setError("Title and Content cannot be empty.");
            return;
        }

        setIsSaving(true);
        try {
            const postData = {
                title,
                content,
                category,
                status, // 'draft' or 'published'
                // isAI: ... logic to determine if AI was involved
            };

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/posts`,
                postData,
                {
                    headers: { 
                        Authorization: `Bearer ${user.token}` 
                    },
                    withCredentials: true
                }
            );

            alert(`Post successfully saved as ${status}!`);
            navigate(`/dashboard/posts`); // Redirect to the post list

        } catch (err) {
            console.error('Save failed:', err);
            setError(`Failed to save post: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
                
                {error && <div className="p-3 text-red-700 bg-red-100 rounded-lg">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        {/* Title Input */}
                        <Label htmlFor="title" className="text-lg font-semibold">Title</Label>
                        <Input 
                            id="title" 
                            placeholder="A Compelling Title for Your Next Blog Post" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="h-12 text-xl"
                        />

                        {/* Tiptap Editor */}
                        <TiptapEditor 
                            initialContent="<p>Click 'AI Draft' to generate ideas, or start typing here...</p>" 
                            onContentChange={setContent} 
                        />
                    </div>

                    <div className="md:col-span-1 space-y-6 bg-white p-6 rounded-lg shadow-md h-full">
                        <h2 className="text-xl font-bold border-b pb-2">Publish Settings</h2>
                        
                        {/* Category Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input 
                                id="category" 
                                placeholder="Technology, AI, Lifestyle" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                            />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
                            <Button 
                                onClick={() => handleSavePost('published')}
                                disabled={isSaving}
                                className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-semibold"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen size={18} className="mr-2" />}
                                Publish Now
                            </Button>
                            <Button 
                                onClick={() => handleSavePost('draft')}
                                disabled={isSaving}
                                variant="outline"
                                className="w-full border-indigo-400 text-indigo-600 hover:bg-indigo-50 h-11 text-base font-semibold"
                            >
                                <Save size={18} className="mr-2" /> Save Draft
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NewPost;