"use client";

import React, { useState } from "react";
import { Send, Search, MoreVertical, Plus } from "lucide-react";

const MessagePage = () => {
  const [selectedContact, setSelectedContact] = useState(1);
  const [inputMessage, setInputMessage] = useState("");

  const contacts = [
    {
      id: 1,
      name: "Jane Cooper",
      message: "Yeah sure, let me zabbr",
      time: "just now",
      avatar: "👩",
      active: true,
      unread: 0,
    },
    {
      id: 2,
      name: "Jenny Wilson",
      message: "Thank you so much, uli",
      time: "2 d",
      avatar: "👩‍🦰",
      active: false,
      unread: 2,
    },
    {
      id: 3,
      name: "Marvin McKinney",
      message: "You're Welcome",
      time: "1 h",
      avatar: "👨",
      active: false,
      unread: 0,
    },
    {
      id: 4,
      name: "Eleanor Pena",
      message: "Thank you so much, uli",
      time: "1 m",
      avatar: "👩‍🦱",
      active: false,
      unread: 1,
    },
    {
      id: 5,
      name: "Ronald Richards",
      message: "Sorry, i can't help you",
      time: "2 m",
      avatar: "👨‍🦲",
      active: false,
      unread: 0,
    },
    {
      id: 6,
      name: "Kathryn Murphy",
      message: "",
      time: "2 m",
      avatar: "👩‍🦳",
      active: false,
      unread: 0,
    },
    {
      id: 7,
      name: "Jacob Jones",
      message: "Thank you so much, uli",
      time: "6 m",
      avatar: "👨‍🦱",
      active: false,
      unread: 0,
    },
    {
      id: 8,
      name: "Cameron Williamson",
      message: "Its okay, no problem bruno, i will fix everythin...",
      time: "8 m",
      avatar: "👨‍🦰",
      active: false,
      unread: 0,
    },
    {
      id: 9,
      name: "Arlene McCoy",
      message: "Thank you so much, uli",
      time: "9 m",
      avatar: "👩‍🦲",
      active: false,
      unread: 0,
    },
    {
      id: 10,
      name: "Dianne Russell",
      message: "You're Welcome",
      time: "9 m",
      avatar: "👩",
      active: false,
      unread: 0,
    },
  ];

  // Different conversation threads for each contact
  const conversationsData = {
    1: [
      {
        id: 1,
        sender: "Jane",
        text: "Hello and thanks for signing up to the course. If you have any questions about the course or Adobe XD, feel free to get in touch and I'll be happy to help!",
        time: "Today",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Yeah sure, let me zabbr",
        time: "Today",
        isOwn: true,
      },
      {
        id: 3,
        sender: "You",
        text: "Only have a small doubt about your lecture. can you give me some time for this?",
        time: "Now",
        isOwn: true,
      },
    ],
    2: [
      {
        id: 1,
        sender: "Jenny",
        text: "Hey! How are you doing?",
        time: "2 days ago",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Thank you so much, uli",
        time: "2 days ago",
        isOwn: true,
      },
    ],
    3: [
      {
        id: 1,
        sender: "You",
        text: "Thanks for your help!",
        time: "1 hour ago",
        isOwn: true,
      },
      {
        id: 2,
        sender: "Marvin",
        text: "You're Welcome",
        time: "1 hour ago",
        isOwn: false,
      },
    ],
    4: [
      {
        id: 1,
        sender: "Eleanor",
        text: "I really appreciate your support!",
        time: "1 minute ago",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Thank you so much, uli",
        time: "1 minute ago",
        isOwn: true,
      },
    ],
    5: [
      {
        id: 1,
        sender: "You",
        text: "Can you help me with this project?",
        time: "2 minutes ago",
        isOwn: true,
      },
      {
        id: 2,
        sender: "Ronald",
        text: "Sorry, i can't help you",
        time: "2 minutes ago",
        isOwn: false,
      },
    ],
  };

  const [messages, setMessages] = useState(conversationsData);

  const handleSend = () => {
    if (inputMessage.trim()) {
      const currentMessages = messages[selectedContact as keyof typeof messages] || [];
      setMessages({
        ...messages,
        [selectedContact]: [
          ...currentMessages,
          {
            id: currentMessages.length + 1,
            sender: "You",
            text: inputMessage,
            time: "Now",
            isOwn: true,
          },
        ],
      });
      setInputMessage("");
    }
  };

  const currentContact = contacts.find(c => c.id === selectedContact);
  const currentMessages = messages[selectedContact as keyof typeof messages] || [];

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='w-[33%] bg-white border-r border-gray-200 flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className=''>Message</h3>
            <button className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700'>
              <Plus size={16} />
              <span>Compose</span>
            </button>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Search'
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className='flex-1 overflow-y-auto'>
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedContact === contact.id ? "bg-blue-50" : ""
              }`}
            >
              <div className='relative'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl'>
                  {contact.avatar}
                </div>
                {contact.active && (
                  <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <h5 className='text-sm font-semibold text-gray-900 truncate'>{contact.name}</h5>
                  <span className='text-xs text-gray-500'>{contact.time}</span>
                </div>
                <p className='text-xs text-gray-600 truncate'>{contact.message}</p>
              </div>

              {contact.unread > 0 && (
                <div className='w-5 h-5 rounded-full bg-red-500 flex items-center justify-center'>
                  <span className='text-xs text-white font-semibold'>{contact.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col bg-white'>
        {/* Chat Header */}
        <div className='px-6 py-3 border-b border-gray-200 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl'>
                {currentContact?.avatar}
              </div>
              {currentContact?.active && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
              )}
            </div>
            <div>
              <h3 className='font-semibold'>{currentContact?.name}</h3>
              <p className='text-xs text-green-600'>
                {currentContact?.active ? "Active Now" : "Offline"}
              </p>
            </div>
          </div>
          <button className='p-2 hover:bg-gray-100 rounded-lg'>
            <MoreVertical
              size={20}
              className='text-gray-600'
            />
          </button>
        </div>

        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4'>
          {currentMessages.map(message => (
            <div
              key={message.id}
              className='flex flex-col'
            >
              {message.time && !message.isOwn && (
                <div className='text-center mb-4'>
                  <span className='px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full'>
                    {message.time}
                  </span>
                </div>
              )}

              <div className={`flex items-start gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}>
                {!message.isOwn && (
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg flex-shrink-0'>
                    {currentContact?.avatar}
                  </div>
                )}

                <div
                  className={`flex flex-col ${message.isOwn ? "items-end" : "items-start"} max-w-lg`}
                >
                  {!message.isOwn && (
                    <span className='text-xs font-medium text-gray-700 mb-1'>{message.sender}</span>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.isOwn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className='text-sm leading-relaxed'>{message.text}</p>
                  </div>
                  {message.isOwn && message.time === "Now" && (
                    <span className='text-xs text-gray-500 mt-1'>{message.time}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className='px-6 py-4 border-t border-gray-200'>
          <div className='flex items-center gap-3'>
            <input
              type='text'
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSend()}
              placeholder='Type your message'
              className='flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
            />
            <button
              onClick={handleSend}
              className='px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded flex items-center gap-2 transition-colors'
            >
              <span className='font-medium'>Send</span>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
