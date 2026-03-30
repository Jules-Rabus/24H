export const mockRaceMediaResponse = {
  "@context": "/contexts/RaceMedia",
  "@id": "/race_medias/1",
  "@type": "RaceMedia",
  fileUrl: "http://example.com/file.jpg",
  status: "pending",
  comment: "Test comment",
  createdAt: new Date().toISOString()
};

export const mockRaceMediaWithoutCommentResponse = {
  "@context": "/contexts/RaceMedia",
  "@id": "/race_medias/2",
  "@type": "RaceMedia",
  fileUrl: "http://example.com/file2.jpg",
  status: "pending",
  comment: null,
  createdAt: new Date().toISOString()
};
