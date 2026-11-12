// Fixture: contains hardcoded values — lint must flag these
const style = {
  color: '#3b82f6',
  backgroundColor: '#ffffff',
  margin: '16px',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid rgb(229, 231, 235)',
};

export default function BadButton() {
  return (
    <button style={{ color: 'rgba(0,0,0,0.9)', borderRadius: '8px' }}>
      Click
    </button>
  );
}
