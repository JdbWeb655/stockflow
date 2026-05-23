import { uploadImage } from '../../supabase/uploadImage';
import { supabase } from '../../supabase';

jest.mock('../../supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ publicURL: 'https://example.com/file.jpg' })
      })
    }
  })
});

test('uploadImage returns public URL', async () => {
  const file = new File(['content'], 'test.png', { type: 'image/png' });
  const url = await uploadImage(file);
  expect(url).toBe('https://example.com/file.jpg');
});