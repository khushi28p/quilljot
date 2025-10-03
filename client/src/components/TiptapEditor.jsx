import React, { useCallback, useState } from 'react'
import { Button } from './ui/button';
import { Loader2, Bold, Italic, List, ListOrdered, Code, Zap } from 'lucide-react';
import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/react';
import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore';

const MenuBar = ({editor, onGenerateAI, isAILoading}) => {
    if(!editor) return null;

    const handleToggle = useCallback((command) => editor.chain().focus()[command]().run(), [editor]);
  const isActive = useCallback((mark) => editor.isActive(mark), [editor]);

    return (
    <div className="flex flex-wrap items-center space-x-2 border-b border-gray-200 p-2 sticky top-0 bg-white z-20 shadow-sm">
      <Button onClick={() => handleToggle('toggleBold')} variant={isActive('bold') ? 'default' : 'outline'} size="sm">
        <Bold size={16} />
      </Button>
      <Button onClick={() => handleToggle('toggleItalic')} variant={isActive('italic') ? 'default' : 'outline'} size="sm">
        <Italic size={16} />
      </Button>
      <Button onClick={() => handleToggle('toggleBulletList')} variant={isActive('bulletList') ? 'default' : 'outline'} size="sm">
        <List size={16} />
      </Button>
      <Button onClick={() => handleToggle('toggleOrderedList')} variant={isActive('orderedList') ? 'default' : 'outline'} size="sm">
        <ListOrdered size={16} />
      </Button>
      <Button onClick={() => handleToggle('toggleCodeBlock')} variant={isActive('codeBlock') ? 'default' : 'outline'} size="sm">
        <Code size={16} />
      </Button>
      
      {/* AI Generation Button */}
      <Button 
        onClick={onGenerateAI}
        disabled={isAILoading}
        className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white"
        size="sm"
      >
        {isAILoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Zap size={16} className="mr-2" />
        )}
        {isAILoading ? 'Generating...' : 'AI Draft'}
      </Button>
    </div>
  );
}

const TiptapEditor = ({ initialContent = '<p>Start writing your new post here...</p>', onContentChange }) => {
  const [isAILoading, setIsAILoading] = useState(false);
  const user = useAuthStore(state => state.user); // Get user for token access

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Pass content back to parent component (e.g., the NewPost form)
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-indigo max-w-none focus:outline-none p-4 min-h-[500px] border-t',
      },
    },
  });

  // --- Gemini API Integration Handler ---
  const handleGenerateAI = async () => {
    if (!editor || !user?.token) return;

    // Use current editor content as context for the AI
    const existingContent = editor.getHTML(); 
    // In the future, collect structured prompt data (topic, tone) from a modal
    const topic = prompt("Enter a topic or keywords for the AI to draft:");
    
    if (!topic) return;

    setIsAILoading(true);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/generate`, 
        { topic, existingContent, tone: 'professional' },
        { 
          headers: { 
            Authorization: `Bearer ${user.token}` 
          },
          withCredentials: true // Important for cookies
        }
      );
      
      const generatedContent = response.data.data.content;

      // Update the Tiptap editor with the AI-generated content
      editor.chain().focus().setContent(generatedContent, true).run();
      
      alert("AI content generated successfully! Review and edit the draft.");

    } catch (error) {
      console.error('AI Generation failed:', error);
      alert('Failed to generate AI content. Check console for details.');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="border rounded-lg shadow-lg">
      <MenuBar editor={editor} onGenerateAI={handleGenerateAI} isAILoading={isAILoading} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapEditor
